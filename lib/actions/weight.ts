"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getCurrentThaiMonthRange, getThaiMonthStart } from "@/lib/thai-month"
import { weightEntrySchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

const MONTHLY_LIMIT_MESSAGE =
  "สามารถลงน้ำหนักและรอบเอวได้เดือนละ 1 ครั้งเท่านั้น หากต้องการแก้ไขข้อมูล กรุณาติดต่อผู้ดูแลระบบ"

export async function addWeightEntry(prevState: { error: string; success: boolean }, formData: FormData) {
  const session = await auth()
  if (!session) {
    return { error: "กรุณาเข้าสู่ระบบ", success: false }
  }

  const raw = formData.get("weight")
  const weight = parseFloat(raw as string)

  const parsed = weightEntrySchema.safeParse({ weight })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", success: false }
  }

  const { start, end } = getCurrentThaiMonthRange()
  const existing = await prisma.weightEntry.findFirst({
    where: {
      userId: session.user.id,
      recordedAt: { gte: start, lt: end },
    },
    select: { id: true },
  })

  if (existing) {
    return { error: MONTHLY_LIMIT_MESSAGE, success: false }
  }

  await prisma.weightEntry.create({
    data: {
      userId: session.user.id,
      weight: parsed.data.weight,
      recordedAt: new Date(),
      recordMonth: getThaiMonthStart(),
    },
  })

  revalidatePath("/")
  revalidatePath("/leaderboard")
  revalidatePath("/dashboard")

  return { error: "", success: true }
}

export async function deleteWeightEntry(id: string) {
  const session = await auth()
  if (!session) return { error: "กรุณาเข้าสู่ระบบ" }

  const entry = await prisma.weightEntry.findUnique({ where: { id } })
  if (!entry || entry.userId !== session.user.id) return { error: "ไม่พบข้อมูลหรือไม่มีสิทธิ์" }

  await prisma.weightEntry.delete({ where: { id } })

  revalidatePath("/")
  revalidatePath("/leaderboard")
  revalidatePath("/dashboard")

  return { error: "" }
}

export async function getMyWeightEntries() {
  const session = await auth()
  if (!session) return []

  return prisma.weightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { recordedAt: "desc" },
  })
}
