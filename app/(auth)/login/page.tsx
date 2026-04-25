"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AppModal from "@/components/shared/AppModal"
import { getLoginNameRequirement, updateLoginName } from "@/lib/actions/auth"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered") === "1"
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [nameFirstName, setNameFirstName] = useState("")
  const [nameLastName, setNameLastName] = useState("")
  const [nameError, setNameError] = useState("")
  const [savingName, setSavingName] = useState(false)
  const [pendingCredentials, setPendingCredentials] = useState<{
    username: string
    password: string
  } | null>(null)

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
        setLoading(false)
      } else {
        const nameRequirement = await getLoginNameRequirement()
        if (nameRequirement.needsUpdate) {
          setNameFirstName(nameRequirement.firstName)
          setNameLastName(nameRequirement.lastName)
          setPendingCredentials({ username, password })
          setNameDialogOpen(true)
          setLoading(false)
          return
        }
        router.replace("/")
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
      setLoading(false)
    }
  }

  async function handleSaveName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError("")
    setSavingName(true)

    const result = await updateLoginName({
      firstName: nameFirstName,
      lastName: nameLastName,
    })
    if (result.error) {
      setNameError(result.error)
      setSavingName(false)
      return
    }

    if (pendingCredentials) {
      await signIn("credentials", {
        username: pendingCredentials.username,
        password: pendingCredentials.password,
        redirect: false,
      })
    }

    router.replace("/")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
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
        <div className="glass-card rounded-2xl p-6">
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
                className="border-white/10 focus:border-[#F59E0B] rounded-xl"
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
                className="border-white/10 focus:border-[#F59E0B] rounded-xl"
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

      <AppModal open={nameDialogOpen} onClose={() => {}} backdropColor="rgba(0,0,0,0.68)">
        <div className="fixed bottom-0 left-0 right-0 w-full rounded-t-2xl glass-panel glass-glow max-h-[90vh] overflow-y-auto p-5 shadow-2xl outline-none border border-white/10 animate-in slide-in-from-bottom-6 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:absolute sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:right-auto sm:w-[calc(100%-2rem)] sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
            <UserRound size={23} />
          </div>
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-[#F59E0B]">กรุณาเพิ่มนามสกุลของคุณ</h2>
          </div>
          <form onSubmit={handleSaveName}>
            <div className="mb-6 space-y-4">
              <p className="text-center text-xs text-[#A8AFBD]">
                พบว่าระบบเรายังไม่มีนามสกุลของคุณในระบบ กรุณาตรวจสอบชื่อจริงและเพิ่มนามสกุลให้ครบถ้วนก่อนใช้งานต่อ
              </p>
              <div className="space-y-1">
                <Label htmlFor="requiredFirstName" className="text-xs text-[#F59E0B]">
                  ชื่อจริง
                </Label>
                <Input
                  id="requiredFirstName"
                  value={nameFirstName}
                  onChange={(e) => setNameFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  className="border-white/10 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="requiredLastName" className="text-xs text-[#F59E0B]">
                  นามสกุล
                </Label>
                <Input
                  id="requiredLastName"
                  value={nameLastName}
                  onChange={(e) => setNameLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                  className="border-white/10 rounded-xl text-sm"
                />
              </div>
              {nameError && <p className="text-center text-[#D08A8A] text-xs">{nameError}</p>}
            </div>
            <Button
              type="submit"
              disabled={savingName}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl py-2 text-sm"
            >
              {savingName ? "กำลังบันทึก..." : "บันทึกและเข้าสู่ระบบ"}
            </Button>
          </form>
        </div>
      </AppModal>
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
