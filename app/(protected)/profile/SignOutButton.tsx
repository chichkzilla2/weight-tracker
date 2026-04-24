"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center justify-between w-full px-5 py-4 hover:bg-[#2A1719] transition-colors text-[#D08A8A]"
    >
      <span className="font-medium flex items-center gap-2">
        <LogOut size={16} />
        ออกจากระบบ
      </span>
    </button>
  )
}
