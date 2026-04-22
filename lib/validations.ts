import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
})

export const weightEntrySchema = z.object({
  weight: z
    .number({ error: "กรุณากรอกน้ำหนักที่ถูกต้อง" })
    .positive("น้ำหนักต้องมากกว่า 0"),
})

export const waistEntrySchema = z.object({
  waist: z
    .number({ error: "กรุณากรอกรอบเอวที่ถูกต้อง" })
    .positive("รอบเอวต้องมากกว่า 0"),
})

export const createUserSchema = z.object({
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  realName: z.string().min(1, "กรุณากรอกชื่อจริง"),
  groupId: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]),
})

export const createGroupSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อกลุ่ม"),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
})

export const registerSchema = z.object({
  realName: z.string().min(1, "กรุณากรอกชื่อจริง").max(100, "ชื่อต้องไม่เกิน 100 ตัวอักษร"),
  username: z.string().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร").max(30, "ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").max(128, "รหัสผ่านต้องไม่เกิน 128 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  groupId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type WeightEntryInput = z.infer<typeof weightEntrySchema>
export type WaistEntryInput = z.infer<typeof waistEntrySchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type RegisterInput = z.infer<typeof registerSchema>
