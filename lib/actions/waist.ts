"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { waistEntrySchema } from "@/lib/validations"
import { revalidatePath } from "next/cache"

export async function addWaistEntry(
  prevState: { error: string; success: boolean },
  formData: FormData,
) {
  const session = await auth()
  if (!session) return { error: "กรุณาเข้าสู่ระบบ", success: false }

  const raw = formData.get("waist")
  const waist = parseFloat(raw as string)

  const parsed = waistEntrySchema.safeParse({ waist })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", success: false }
  }

  await prisma.waistEntry.create({
    data: { userId: session.user.id, waist: parsed.data.waist, recordedAt: new Date() },
  })

  revalidatePath("/")
  revalidatePath("/leaderboard")
  revalidatePath("/dashboard")
  return { error: "", success: true }
}

export async function deleteWaistEntry(id: string) {
  const session = await auth()
  if (!session) return { error: "กรุณาเข้าสู่ระบบ" }

  const entry = await prisma.waistEntry.findUnique({ where: { id } })
  if (!entry || entry.userId !== session.user.id) return { error: "ไม่พบข้อมูลหรือไม่มีสิทธิ์" }

  await prisma.waistEntry.delete({ where: { id } })
  revalidatePath("/")
  revalidatePath("/leaderboard")
  revalidatePath("/dashboard")
  return { error: "" }
}
