"use client"

import { useState, useActionState } from "react"
import { changePassword } from "@/lib/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, ChevronDown } from "lucide-react"

const initialState = { error: "", success: false }

export default function ChangePasswordForm() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(changePassword, initialState)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#FDFAF5] transition-colors"
      >
        <span className="text-[#2C1810] font-medium">เปลี่ยนรหัสผ่าน</span>
        {open ? (
          <ChevronDown size={18} className="text-[#D4C4A8]" />
        ) : (
          <ChevronRight size={18} className="text-[#D4C4A8]" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-[#EDE3D0]">
          <form action={formAction} className="space-y-3 mt-3">
            <div className="space-y-1">
              <Label className="text-sm text-[#5C3D1E]">รหัสผ่านปัจจุบัน</Label>
              <Input
                name="currentPassword"
                type="password"
                placeholder="รหัสผ่านปัจจุบัน"
                required
                className="border-[#D4C4A8] rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-[#5C3D1E]">รหัสผ่านใหม่</Label>
              <Input
                name="newPassword"
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                required
                className="border-[#D4C4A8] rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-[#5C3D1E]">ยืนยันรหัสผ่านใหม่</Label>
              <Input
                name="confirmPassword"
                type="password"
                placeholder="ยืนยันรหัสผ่านใหม่"
                required
                className="border-[#D4C4A8] rounded-xl text-sm"
              />
            </div>

            {state.error && (
              <p className="text-red-500 text-xs">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-600 text-xs">เปลี่ยนรหัสผ่านเรียบร้อย ✓</p>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#5C3D1E] hover:bg-[#2C1810] text-white rounded-xl py-2 text-sm"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
