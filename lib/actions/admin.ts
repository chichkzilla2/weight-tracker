"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createUserSchema, createGroupSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("ไม่มีสิทธิ์เข้าถึง")
  }
  return session
}

export async function createUser(
  prevState: { error: string; success: boolean },
  formData: FormData
) {
  await requireAdmin()

  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    realName: formData.get("realName") as string,
    groupId: formData.get("groupId") as string,
    role: formData.get("role") as string,
  }

  const parsed = createUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", success: false }
  }

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } })
  if (existing) {
    return { error: "ชื่อผู้ใช้นี้มีอยู่แล้ว", success: false }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  try {
    await prisma.user.create({
      data: {
        username: parsed.data.username,
        passwordHash,
        realName: parsed.data.realName,
        groupId: parsed.data.groupId,
        role: parsed.data.role as "USER" | "ADMIN",
      },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "ชื่อผู้ใช้นี้มีอยู่แล้ว", success: false }
    }
    throw err
  }

  revalidatePath("/admin")
  return { error: "", success: true }
}

export async function deleteUser(userId: string): Promise<{ error?: string; success: boolean }> {
  await requireAdmin()

  try {
    await prisma.$transaction([
      prisma.weightEntry.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ])
  } catch (err) {
    console.error(err)
    return { error: "ลบผู้ใช้ไม่สำเร็จ", success: false }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function createGroup(
  prevState: { error: string; success: boolean },
  formData: FormData
) {
  await requireAdmin()

  const raw = { name: formData.get("name") as string }
  const parsed = createGroupSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", success: false }
  }

  const existing = await prisma.group.findUnique({ where: { name: parsed.data.name } })
  if (existing) {
    return { error: "ชื่อกลุ่มนี้มีอยู่แล้ว", success: false }
  }

  try {
    await prisma.group.create({ data: { name: parsed.data.name } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "ชื่อกลุ่มนี้มีอยู่แล้ว", success: false }
    }
    throw err
  }

  revalidatePath("/admin")
  return { error: "", success: true }
}

export async function changeUserGroup(
  userId: string,
  groupId: string
): Promise<{ error?: string; success: boolean }> {
  await requireAdmin()

  const group = await prisma.group.findUnique({ where: { id: groupId } })
  if (!group) return { error: "ไม่พบกลุ่ม", success: false }

  await prisma.user.update({ where: { id: userId }, data: { groupId } })
  revalidatePath("/admin")
  return { success: true }
}

export async function updateGroupName(
  groupId: string,
  name: string
): Promise<{ error?: string; success: boolean }> {
  await requireAdmin()

  const trimmed = name.trim()
  if (!trimmed) return { error: "กรุณากรอกชื่อกลุ่ม", success: false }

  const existing = await prisma.group.findUnique({ where: { name: trimmed } })
  if (existing && existing.id !== groupId) {
    return { error: "ชื่อกลุ่มนี้มีอยู่แล้ว", success: false }
  }

  try {
    await prisma.group.update({ where: { id: groupId }, data: { name: trimmed } })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "ชื่อกลุ่มนี้มีอยู่แล้ว", success: false }
    }
    throw err
  }

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteGroup(groupId: string): Promise<{ error?: string; success: boolean }> {
  await requireAdmin()

  const usersInGroup = await prisma.user.count({ where: { groupId } })
  if (usersInGroup > 0) {
    return { error: "ไม่สามารถลบกลุ่มที่มีสมาชิกได้", success: false }
  }

  try {
    await prisma.group.delete({ where: { id: groupId } })
  } catch (err) {
    console.error(err)
    return { error: "ลบกลุ่มไม่สำเร็จ", success: false }
  }

  revalidatePath("/admin")
  return { success: true }
}
