"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered") === "1"
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏋️</div>
          <h1 className="text-2xl font-bold text-[#F59E0B] mb-2">Weight Tracker</h1>
          <p className="text-[#A8AFBD] text-sm">บันทึกน้ำหนักเพื่อสุขภาพที่ดีขึ้น</p>
        </div>

        {registered && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-green-700 text-sm text-center">สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ</p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-[#171A20] border border-[#343A46] rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#F59E0B] font-medium">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                required
                autoComplete="username"
                className="border-[#343A46] focus:border-[#F59E0B] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F59E0B] font-medium">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                required
                autoComplete="current-password"
                className="border-[#343A46] focus:border-[#F59E0B] rounded-xl"
              />
            </div>

            {error && (
              <div className="bg-[#2A1719] border border-[#5A3032] rounded-xl px-4 py-3">
                <p className="text-[#C77D7D] text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl py-3 font-medium text-base transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-[#A8AFBD] mt-4">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-[#F59E0B] font-medium hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
