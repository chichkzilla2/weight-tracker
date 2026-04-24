import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import GroupBadge from "@/components/shared/GroupBadge";
import ChangePasswordForm from "./ChangePasswordForm";
import SignOutButton from "./SignOutButton";
import { ChevronRight, Download } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { group: true },
  });

  if (!user) return null;

  const initial = user.realName?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="👤 โปรไฟล์" subtitle="ข้อมูลส่วนตัวของคุณ" />
      <div className="px-4 pb-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#F59E0B] flex items-center justify-center text-[#111318] text-3xl font-bold mb-3 shadow-md">
            {initial}
          </div>
          <h2 className="text-xl font-bold text-[#E7EAF0] mb-2">
            {user.realName}
          </h2>
          <GroupBadge name={user.group?.name} />
          {user.role === "ADMIN" && (
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F59E0B] text-[#111318]">
              ผู้ดูแลระบบ
            </span>
          )}
        </div>

        {/* Info */}
        <div className="bg-[#171A20] border border-[#343A46] rounded-2xl shadow-sm p-4 mb-4">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A8AFBD]">ชื่อผู้ใช้</span>
              <span className="text-[#E7EAF0] font-medium">
                {user.username}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A8AFBD]">ชื่อจริง</span>
              <span className="text-[#E7EAF0] font-medium">
                {user.realName}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-[#171A20] border border-[#343A46] rounded-2xl shadow-sm overflow-hidden mb-4">
          <ChangePasswordForm />
          <div className="border-t border-[#242832]" />
          {user.role === "ADMIN" && (
            <>
              <a
                href="/admin"
                className="flex items-center justify-between px-5 py-4 hover:bg-[#0F1115] transition-colors"
              >
                <span className="text-[#E7EAF0] font-medium">
                  แผงผู้ดูแลระบบ
                </span>
                <ChevronRight size={18} className="text-[#343A46]" />
              </a>
              <div className="border-t border-[#242832]" />
              <a
                href="/api/admin/users-pdf"
                className="flex items-center justify-between px-5 py-4 hover:bg-[#0F1115] transition-colors"
              >
                <span className="text-[#E7EAF0] font-medium">
                  ดาวน์โหลดรายชื่อสมาชิก
                </span>
                <Download size={18} className="text-[#343A46]" />
              </a>
              <div className="border-t border-[#242832]" />
            </>
          )}
          <SignOutButton />
        </div>

        <p className="text-center text-xs text-[#343A46] mt-8">
          เวอร์ชัน 3.0.1
        </p>
      </div>
    </div>
  );
}
