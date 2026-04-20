"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/actions/auth"

interface Group {
  id: string
  name: string
}

interface Props {
  groups: Group[]
}

export default function RegisterForm({ groups }: Props) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      realName: formData.get("realName") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      groupId: formData.get("groupId") as string,
    }

    try {
      const result = await registerUser(data)
      if (result.error) {
        setError(result.error)
      } else {
        router.push("/login?registered=1")
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAF5] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏋️</div>
          <h1 className="text-2xl font-bold text-[#5C3D1E] mb-2">Weight Tracker</h1>
          <p className="text-[#A08060] text-sm">สมัครสมาชิกเพื่อเริ่มต้นติดตามสุขภาพ</p>
        </div>

        {/* Register Card */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realName" className="text-[#5C3D1E] font-medium">
                ชื่อจริง
              </Label>
              <Input
                id="realName"
                name="realName"
                type="text"
                placeholder="กรอกชื่อจริง"
                required
                autoComplete="name"
                className="border-[#D4C4A8] focus:border-[#5C3D1E] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#5C3D1E] font-medium">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                required
                autoComplete="username"
                className="border-[#D4C4A8] focus:border-[#5C3D1E] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#5C3D1E] font-medium">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                required
                autoComplete="new-password"
                className="border-[#D4C4A8] focus:border-[#5C3D1E] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#5C3D1E] font-medium">
                ยืนยันรหัสผ่าน
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
                autoComplete="new-password"
                className="border-[#D4C4A8] focus:border-[#5C3D1E] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId" className="text-[#5C3D1E] font-medium">
                กลุ่ม <span className="text-[#A08060] font-normal text-xs">(ไม่บังคับ)</span>
              </Label>
              <select
                id="groupId"
                name="groupId"
                defaultValue=""
                className="w-full border border-[#D4C4A8] focus:border-[#5C3D1E] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] outline-none focus:ring-1 focus:ring-[#5C3D1E]"
              >
                <option value="">ไม่เลือกกลุ่ม (สามารถเลือกภายหลังได้)</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5C3D1E] hover:bg-[#2C1810] text-white rounded-xl py-3 font-medium text-base transition-colors"
            >
              {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#A08060] mt-4">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="text-[#5C3D1E] font-medium hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
