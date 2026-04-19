import { auth } from "@/lib/auth"
import GroupBadge from "@/components/shared/GroupBadge"
import ChangePasswordForm from "./ChangePasswordForm"
import SignOutButton from "./SignOutButton"
import { ChevronRight } from "lucide-react"
import PageHeader from "@/components/shared/PageHeader"

export default async function ProfilePage() {
  const session = await auth()
  if (!session) return null

  const initial = session.user.realName?.[0]?.toUpperCase() ?? "U"

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="👤 โปรไฟล์" subtitle="ข้อมูลส่วนตัวของคุณ" />
      <div className="px-4 pb-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#5C3D1E] flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md">
            {initial}
          </div>
          <h2 className="text-xl font-bold text-[#2C1810] mb-2">{session.user.realName}</h2>
          <GroupBadge name={session.user.groupName} />
          {session.user.role === "ADMIN" && (
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#5C3D1E] text-white">
              ผู้ดูแลระบบ
            </span>
          )}
        </div>

        {/* Info */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4 mb-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A08060]">ชื่อผู้ใช้</span>
              <span className="text-[#2C1810] font-medium">{session.user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A08060]">ชื่อจริง</span>
              <span className="text-[#2C1810] font-medium">{session.user.realName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A08060]">กลุ่ม</span>
              <span className="text-[#2C1810] font-medium">{session.user.groupName}</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden mb-4">
          {/* Change Password */}
          <ChangePasswordForm />

          <div className="border-t border-[#EDE3D0]" />

          {/* Admin Panel */}
          {session.user.role === "ADMIN" && (
            <>
              <a
                href="/admin"
                className="flex items-center justify-between px-5 py-4 hover:bg-[#FDFAF5] transition-colors"
              >
                <span className="text-[#2C1810] font-medium">แผงผู้ดูแลระบบ</span>
                <ChevronRight size={18} className="text-[#D4C4A8]" />
              </a>
              <div className="border-t border-[#EDE3D0]" />
            </>
          )}

          {/* Sign Out */}
          <SignOutButton />
        </div>

        <p className="text-center text-xs text-[#D4C4A8] mt-8">เวอร์ชัน 1.0.0</p>
      </div>
    </div>
  )
}
