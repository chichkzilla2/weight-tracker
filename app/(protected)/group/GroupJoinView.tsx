"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { joinGroup } from "@/lib/actions/profile"
import { Loader2 } from "lucide-react"
import PageHeader from "@/components/shared/PageHeader"

interface Group { id: string; name: string; memberCount: number }

export default function GroupJoinView({ groups }: { groups: Group[] }) {
  const [isPending, startTransition] = useTransition()
  const [joiningId, setJoiningId] = useState<string | null>(null)

  function handleJoin(groupId: string) {
    setJoiningId(groupId)
    startTransition(async () => {
      const res = await joinGroup(groupId)
      if (res.error) { toast.error(res.error); setJoiningId(null) }
      else toast.success("เข้าร่วมกลุ่มสำเร็จ!")
    })
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="👥 กลุ่ม" subtitle="เลือกกลุ่มที่ต้องการเข้าร่วม" />
      <div className="px-4 pb-6 space-y-3">
        <div className="bg-[#1F232B] border border-white/10 rounded-2xl p-3">
          <p className="text-xs text-[#F59E0B]">
            หากต้องการเปลี่ยนกลุ่มหลังจากเลือกแล้ว กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>

        <div className="bg-[#242832]/65 border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-sm font-medium text-[#F59E0B]">คุณยังไม่ได้อยู่ในกลุ่มใด</p>
          <p className="text-xs text-[#A8AFBD] mt-1">เลือกกลุ่มด้านล่างเพื่อเข้าร่วม</p>
        </div>

        {groups.length === 0 && (
          <p className="text-center text-sm text-[#A8AFBD] py-8">ยังไม่มีกลุ่ม กรุณาติดต่อผู้ดูแลระบบ</p>
        )}

        {groups.map((g) => {
          const isFull = g.memberCount >= 10
          return (
            <div
              key={g.id}
              className={`bg-[#171A20]/70 border rounded-2xl p-4 flex items-center justify-between ${isFull ? "border-white/10 opacity-60" : "border-white/10"}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#E7EAF0] text-sm">{g.name}</p>
                <p className="text-xs text-[#A8AFBD] mt-0.5">
                  {g.memberCount}/10 สมาชิก{isFull && " · เต็มแล้ว"}
                </p>
                <div className="w-28 bg-[#242832]/65 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-[#F59E0B] h-1.5 rounded-full"
                    style={{ width: `${(g.memberCount / 10) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => handleJoin(g.id)}
                disabled={isFull || isPending}
                className="ml-4 px-4 py-2 bg-[#F59E0B] text-[#111318] text-xs font-semibold rounded-xl hover:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
              >
                {isPending && joiningId === g.id ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : "เข้าร่วม"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
