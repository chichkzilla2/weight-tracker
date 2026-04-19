"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { registerSchema } from "@/lib/validations"
import { Prisma } from "@prisma/client"

export async function registerUser(data: unknown): Promise<{ error?: string; success: boolean }> {
  const parsed = registerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", success: false }
  }

  const { realName, username, password, groupId } = parsed.data

  const passwordHash = await bcrypt.hash(password, 12)

  try {
    await prisma.user.create({
      data: {
        username,
        passwordHash,
        realName,
        role: "USER",
        groupId,
      },
    })
    return { success: true }
  } catch (err) {
    console.error("registerUser failed:", err instanceof Error ? err.message : String(err))
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "ชื่อผู้ใช้นี้มีอยู่แล้ว", success: false }
    }
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่", success: false }
  }
}
