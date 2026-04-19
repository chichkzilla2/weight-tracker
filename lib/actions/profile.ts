"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { changePasswordSchema } from "@/lib/validations"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function changePassword(
  prevState: { error: string; success: boolean },
  formData: FormData
) {
  const session = await auth()
  if (!session) {
    return { error: "กรุณาเข้าสู่ระบบ", success: false }
  }

  const raw = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  }

  const parsed = changePasswordSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง", success: false }
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return { error: "ไม่พบผู้ใช้", success: false }
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
  if (!valid) {
    return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง", success: false }
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash },
  })

  revalidatePath("/profile")
  return { error: "", success: true }
}
