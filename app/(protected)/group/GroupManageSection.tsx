"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { joinGroup, leaveGroup } from "@/lib/actions/profile"
import { Loader2 } from "lucide-react"
import { GlassSelect } from "@/components/shared/GlassSelect"

interface Group { id: string; name: string }

interface Props {
  currentGroupId: string
  currentGroupName: string
  groups: Group[]
}

export default function GroupManageSection({ currentGroupId, currentGroupName, groups }: Props) {
  const [isPending, startTransition] = useTransition()
  const otherGroups = groups.filter((g) => g.id !== currentGroupId)

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

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3">
      <p className="text-sm font-semibold text-[#F59E0B]">จัดการกลุ่ม</p>

      {otherGroups.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-[#A8AFBD]">เปลี่ยนไปกลุ่มอื่น</p>
          <GlassSelect
            key={currentGroupId}
            defaultValue=""
            disabled={isPending}
            onChange={handleChange}
            options={[
              { value: "", label: "เลือกกลุ่ม..." },
              ...otherGroups.map((g) => ({ value: g.id, label: g.name })),
            ]}
          />
        </div>
      )}

      <div className="border-t border-white/10 pt-3">
        <button
          onClick={handleLeave}
          disabled={isPending}
          className="flex items-center gap-2 text-sm text-[#D08A8A] hover:text-[#D08A8A] disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          ออกจากกลุ่ม {currentGroupName}
        </button>
      </div>
    </div>
  )
}
