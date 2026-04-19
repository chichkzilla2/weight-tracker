"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { weightEntrySchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

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

  await prisma.weightEntry.create({
    data: {
      userId: session.user.id,
      weight: parsed.data.weight,
      recordedAt: new Date(),
    },
  })

  revalidatePath("/")
  revalidatePath("/leaderboard")
  revalidatePath("/dashboard")

  return { error: "", success: true }
}

export async function getMyWeightEntries() {
  const session = await auth()
  if (!session) return []

  return prisma.weightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { recordedAt: "desc" },
  })
}
