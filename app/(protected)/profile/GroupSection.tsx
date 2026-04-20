"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { joinGroup, leaveGroup } from "@/lib/actions/profile"
import { Loader2 } from "lucide-react"

interface Group { id: string; name: string }

interface Props {
  currentGroupId: string | null
  currentGroupName: string | null
  groups: Group[]
}

export default function GroupSection({ currentGroupId, currentGroupName, groups }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleJoin() {
    if (!selectedGroupId) return
    startTransition(async () => {
      const res = await joinGroup(selectedGroupId)
      if (res.error) toast.error(res.error)
      else { toast.success("เข้าร่วมกลุ่มสำเร็จ"); setSelectedGroupId("") }
    })
  }

  function handleChange(newGroupId: string) {
    if (!newGroupId) return
    startTransition(async () => {
      const res = await joinGroup(newGroupId)
      if (res.error) toast.error(res.error)
      else toast.success("เปลี่ยนกลุ่มสำเร็จ")
    })
  }

  function handleLeave() {
    startTransition(async () => {
      const res = await leaveGroup()
      if (res.error) toast.error(res.error)
      else toast.success("ออกจากกลุ่มแล้ว")
    })
  }

  if (currentGroupId) {
    const otherGroups = groups.filter((g) => g.id !== currentGroupId)
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EDE3D0] text-[#5C3D1E] border border-[#D4C4A8]">
            {currentGroupName}
          </span>
          <button
            onClick={handleLeave}
            disabled={isPending}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : "ออกจากกลุ่ม"}
          </button>
        </div>
        {otherGroups.length > 0 && (
          <select
            onChange={(e) => handleChange(e.target.value)}
            defaultValue=""
            disabled={isPending}
            className="w-full border border-[#D4C4A8] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:border-[#5C3D1E] disabled:opacity-50"
          >
            <option value="">เปลี่ยนไปกลุ่มอื่น...</option>
            {otherGroups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#A08060]">ยังไม่ได้เข้าร่วมกลุ่ม สามารถเลือกได้ที่นี่</p>
      <div className="flex gap-2">
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          disabled={isPending}
          className="flex-1 border border-[#D4C4A8] rounded-xl px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:border-[#5C3D1E] disabled:opacity-50"
        >
          <option value="">เลือกกลุ่ม...</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <button
          onClick={handleJoin}
          disabled={isPending || !selectedGroupId}
          className="px-4 py-2 bg-[#5C3D1E] text-white text-sm rounded-xl hover:bg-[#2C1810] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : "เข้าร่วม"}
        </button>
      </div>
    </div>
  )
}
