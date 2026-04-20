"use client"

import { useState, useActionState, useEffect } from "react"
import { toast } from "sonner"
import { createUser, deleteUser, createGroup, deleteGroup, changeUserGroup, updateGroupName } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatThaiDate } from "@/lib/calculations"
import { Plus, Trash2, Pencil } from "lucide-react"
import Modal from "@mui/material/Modal"

interface UserData {
  id: string
  username: string
  realName: string
  role: string
  groupId: string
  groupName: string
  createdAt: string
  latestWeight: number | null
}

interface GroupData {
  id: string
  name: string
  createdAt: string
}

interface EntryData {
  id: string
  weight: number
  recordedAt: string
  userId: string
  userName: string
  groupName: string
}

interface AdminClientProps {
  users: UserData[]
  groups: GroupData[]
  entries: EntryData[]
}

type Tab = "users" | "groups" | "entries"

type DialogState =
  | { type: "saveGroups"; changes: { userId: string; userName: string; oldGroupName: string; newGroupName: string }[] }
  | { type: "deleteUser"; userId: string; userName: string }
  | { type: "deleteGroup"; groupId: string; groupName: string }
  | { type: "editGroup"; groupId: string; groupName: string }
  | null

const initialUserState = { error: "", success: false }
const initialGroupState = { error: "", success: false }

export default function AdminClient({ users, groups, entries }: AdminClientProps) {
  const [tab, setTab] = useState<Tab>("users")
  const [showUserForm, setShowUserForm] = useState(false)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editGroupName, setEditGroupName] = useState("")

  // User search & filters
  const [userSearch, setUserSearch] = useState("")
  const [userGroupFilter, setUserGroupFilter] = useState("")
  const [userWeightMin, setUserWeightMin] = useState("")
  const [userWeightMax, setUserWeightMax] = useState("")

  // Group search
  const [groupSearch, setGroupSearch] = useState("")
  const [dialog, setDialog] = useState<DialogState>(null)
  const [confirming, setConfirming] = useState(false)

  const [userGroupSelections, setUserGroupSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.groupId ?? ""]))
  )
  const [userState, userFormAction, userPending] = useActionState(createUser, initialUserState)
  const [groupState, groupFormAction, groupPending] = useActionState(createGroup, initialGroupState)

  useEffect(() => {
    if (userState.success) toast.success("เพิ่มผู้ใช้เรียบร้อย")
    else if (userState.error) toast.error(userState.error)
  }, [userState])

  useEffect(() => {
    if (groupState.success) toast.success("เพิ่มกลุ่มเรียบร้อย")
    else if (groupState.error) toast.error(groupState.error)
  }, [groupState])

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase()
    if (q && !u.realName.toLowerCase().includes(q) && !u.username.toLowerCase().includes(q)) return false
    if (userGroupFilter && (u.groupId || "") !== userGroupFilter) return false
    if (userWeightMin !== "" && (u.latestWeight === null || u.latestWeight < parseFloat(userWeightMin))) return false
    if (userWeightMax !== "" && (u.latestWeight === null || u.latestWeight > parseFloat(userWeightMax))) return false
    return true
  })

  const filteredGroups = groups.filter((g) =>
    groupSearch === "" || g.name.toLowerCase().includes(groupSearch.toLowerCase())
  )

  const pendingGroupChanges = users
    .filter((u) => (userGroupSelections[u.id] ?? u.groupId ?? "") !== (u.groupId ?? ""))
    .map((u) => ({
      userId: u.id,
      userName: u.realName,
      oldGroupName: u.groupName,
      newGroupName: groups.find((g) => g.id === userGroupSelections[u.id])?.name ?? "ไม่มีกลุ่ม",
    }))

  async function handleConfirm() {
    if (!dialog) return
    setConfirming(true)

    if (dialog.type === "saveGroups") {
      const results = await Promise.all(
        dialog.changes.map((c) => changeUserGroup(c.userId, userGroupSelections[c.userId] ?? c.userId))
      )
      const failed = results.filter((r) => r.error)
      if (failed.length > 0) {
        toast.error(failed[0]?.error ?? "เกิดข้อผิดพลาด")
      } else {
        toast.success(`บันทึกการเปลี่ยนกลุ่มเรียบร้อย (${dialog.changes.length} รายการ)`)
      }
    }

    if (dialog.type === "deleteUser") {
      const result = await deleteUser(dialog.userId)
      if (result.error) toast.error(result.error)
      else toast.success(`ลบผู้ใช้ ${dialog.userName} เรียบร้อย`)
    }

    if (dialog.type === "deleteGroup") {
      const result = await deleteGroup(dialog.groupId)
      if (result.error) toast.error(result.error)
      else toast.success(`ลบกลุ่ม ${dialog.groupName} เรียบร้อย`)
    }

    if (dialog.type === "editGroup") {
      const result = await updateGroupName(dialog.groupId, editGroupName)
      if (result.error) {
        toast.error(result.error)
        setConfirming(false)
        return
      }
      toast.success("แก้ไขชื่อกลุ่มเรียบร้อย")
    }

    setConfirming(false)
    setDialog(null)
  }

  const tabs = [
    { key: "users" as Tab, label: "จัดการผู้ใช้" },
    { key: "groups" as Tab, label: "จัดการกลุ่ม" },
    { key: "entries" as Tab, label: "บันทึกน้ำหนัก" },
  ]
  const tabIndex = tabs.findIndex((t) => t.key === tab)

  return (
    <div>
      {/* Confirmation Dialog */}
      <Modal
        open={dialog !== null}
        onClose={() => { if (!confirming) setDialog(null) }}
        slotProps={{ backdrop: { style: { backgroundColor: "rgba(0,0,0,0.55)" } } }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-sm p-5 outline-none">
          {dialog?.type === "saveGroups" && (
            <>
              <h3 className="font-bold text-[#2C1810] text-base mb-1">ยืนยันการเปลี่ยนกลุ่ม</h3>
              <p className="text-xs text-[#A08060] mb-3">รายการที่จะเปลี่ยน {dialog.changes.length} รายการ</p>
              <div className="space-y-2 mb-4 max-h-48 overflow-x-auto overflow-y-auto">
                {dialog.changes.map((c) => (
                  <div key={c.userId} className="flex items-center gap-2 text-sm bg-[#FDFAF5] rounded-lg px-3 py-2 min-w-max">
                    <span className="font-medium text-[#2C1810] flex-1">{c.userName}</span>
                    <span className="text-[#A08060] text-xs">{c.oldGroupName}</span>
                    <span className="text-[#A08060] text-xs">→</span>
                    <span className="text-[#5C3D1E] font-medium text-xs">{c.newGroupName}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {dialog?.type === "deleteUser" && (
            <>
              <h3 className="font-bold text-[#2C1810] text-base mb-1">ยืนยันการลบผู้ใช้</h3>
              <p className="text-sm text-[#A08060] mb-4">
                ลบ <span className="font-semibold text-[#2C1810]">{dialog.userName}</span> ออกจากระบบ? ข้อมูลน้ำหนักทั้งหมดจะถูกลบด้วย
              </p>
            </>
          )}
          {dialog?.type === "deleteGroup" && (
            <>
              <h3 className="font-bold text-[#2C1810] text-base mb-1">ยืนยันการลบกลุ่ม</h3>
              <p className="text-sm text-[#A08060] mb-4">
                ลบกลุ่ม <span className="font-semibold text-[#2C1810]">{dialog.groupName}</span> ออกจากระบบ?
              </p>
            </>
          )}
          {dialog?.type === "editGroup" && (
            <>
              <h3 className="font-bold text-[#2C1810] text-base mb-1">แก้ไขชื่อกลุ่ม</h3>
              <div className="space-y-1 mb-4">
                <Label className="text-xs text-[#5C3D1E]">ชื่อกลุ่ม</Label>
                <Input
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  autoFocus
                  className="border-[#D4C4A8] rounded-xl text-sm"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => setDialog(null)}
              disabled={confirming}
              className="flex-1 py-2 rounded-xl text-sm font-medium border border-[#D4C4A8] text-[#A08060] hover:bg-[#F7F0E4] transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className={`flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                dialog?.type === "deleteUser" || dialog?.type === "deleteGroup"
                  ? "bg-red-700 hover:bg-red-900"
                  : "bg-[#5C3D1E] hover:bg-[#2C1810]"
              }`}
            >
              {confirming ? "กำลังดำเนินการ..." : "ยืนยัน"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Tab bar */}
      <div className="relative flex bg-[#EDE3D0] rounded-xl p-1 mb-5">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-[#5C3D1E] shadow-sm pointer-events-none"
          style={{
            width: "calc((100% - 8px) / 3)",
            transform: `translateX(${tabIndex * 100}%)`,
            transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative z-10 flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-200 ${
              tab === t.key ? "text-white" : "text-[#A08060]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-[#A08060]">ผู้ใช้ทั้งหมด {users.length} คน</p>
            <Button
              onClick={() => setShowUserForm((v) => !v)}
              className="bg-[#5C3D1E] hover:bg-[#2C1810] text-white rounded-xl text-sm py-1.5 px-3 h-auto"
            >
              <Plus size={14} className="mr-1" />
              เพิ่มผู้ใช้
            </Button>
          </div>

          {showUserForm && (
            <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-[#5C3D1E] mb-3 text-sm">เพิ่มผู้ใช้ใหม่</h3>
              <form action={userFormAction} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#5C3D1E]">ชื่อจริง</Label>
                    <Input name="realName" placeholder="ชื่อจริง" required className="border-[#D4C4A8] rounded-xl text-sm" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#5C3D1E]">ชื่อผู้ใช้</Label>
                    <Input name="username" placeholder="username" required className="border-[#D4C4A8] rounded-xl text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-[#5C3D1E]">รหัสผ่าน</Label>
                  <Input name="password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" required className="border-[#D4C4A8] rounded-xl text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-[#5C3D1E]">กลุ่ม</Label>
                    <select name="groupId" required className="w-full border border-[#D4C4A8] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#5C3D1E]">
                      <option value="">เลือกกลุ่ม</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-[#5C3D1E]">บทบาท</Label>
                    <select name="role" defaultValue="USER" className="w-full border border-[#D4C4A8] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#5C3D1E]">
                      <option value="USER">ผู้ใช้งาน</option>
                      <option value="ADMIN">ผู้ดูแลระบบ</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" disabled={userPending} className="w-full bg-[#5C3D1E] hover:bg-[#2C1810] text-white rounded-xl py-2 text-sm">
                  {userPending ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </form>
            </div>
          )}

          {/* Search & filter bar */}
          <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-3 mb-3 space-y-2">
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="ค้นหาชื่อ / username..."
              className="w-full text-sm border border-[#D4C4A8] rounded-xl px-3 py-2 focus:outline-none focus:border-[#5C3D1E]"
            />
            <div className="flex gap-2">
              <select
                value={userGroupFilter}
                onChange={(e) => setUserGroupFilter(e.target.value)}
                className="flex-1 text-xs border border-[#D4C4A8] rounded-lg px-2 py-1.5 bg-white text-[#5C3D1E] focus:outline-none focus:border-[#5C3D1E]"
              >
                <option value="">ทุกกลุ่ม</option>
                {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input
                type="number"
                value={userWeightMin}
                onChange={(e) => setUserWeightMin(e.target.value)}
                placeholder="น้ำหนักต่ำสุด"
                className="w-24 text-xs border border-[#D4C4A8] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#5C3D1E]"
              />
              <input
                type="number"
                value={userWeightMax}
                onChange={(e) => setUserWeightMax(e.target.value)}
                placeholder="สูงสุด"
                className="w-20 text-xs border border-[#D4C4A8] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#5C3D1E]"
              />
            </div>
          </div>

          <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F0E4] border-b border-[#D4C4A8] sticky top-0 z-10">
                    <th className="text-left px-3 py-2.5 font-semibold text-[#5C3D1E]">ชื่อ</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#5C3D1E]">กลุ่ม</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-[#5C3D1E]">น้ำหนัก</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#5C3D1E]">บทบาท</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-[#EDE3D0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}>
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-[#2C1810]">{u.realName}</p>
                        <p className="text-xs text-[#A08060]">{u.username}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={userGroupSelections[u.id] ?? u.groupId ?? ""}
                          onChange={(e) => setUserGroupSelections((prev) => ({ ...prev, [u.id]: e.target.value }))}
                          className={`text-xs border rounded-lg px-2 py-1 bg-white cursor-pointer focus:outline-none focus:border-[#5C3D1E] ${
                            (userGroupSelections[u.id] ?? u.groupId ?? "") !== (u.groupId ?? "")
                              ? "border-[#5C3D1E] text-[#5C3D1E] font-semibold"
                              : "border-[#D4C4A8] text-[#5C3D1E]"
                          }`}
                        >
                          <option value="">ไม่มีกลุ่ม</option>
                          {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-[#5C3D1E] text-xs">
                        {u.latestWeight !== null ? `${u.latestWeight.toFixed(1)}` : <span className="text-[#D4C4A8]">—</span>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-[#5C3D1E] text-white" : "bg-[#EDE3D0] text-[#5C3D1E]"}`}>
                          {u.role === "ADMIN" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => setDialog({ type: "deleteUser", userId: u.id, userName: u.realName })}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="ลบผู้ใช้"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Save button below table */}
            <div className="px-3 py-2.5 border-t border-[#EDE3D0] flex items-center justify-between bg-white">
              <p className="text-xs text-[#A08060]">
                {pendingGroupChanges.length > 0 ? `${pendingGroupChanges.length} รายการที่รอบันทึก` : "ไม่มีการเปลี่ยนแปลง"}
              </p>
              <button
                disabled={pendingGroupChanges.length === 0}
                onClick={() => setDialog({ type: "saveGroups", changes: pendingGroupChanges })}
                className="text-xs px-4 py-1.5 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#2C1810] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups Tab */}
      {tab === "groups" && (
        <div>
          <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-3 mb-3">
            <input
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="ค้นหาชื่อกลุ่ม..."
              className="w-full text-sm border border-[#D4C4A8] rounded-xl px-3 py-2 focus:outline-none focus:border-[#5C3D1E]"
            />
          </div>

          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-[#A08060]">กลุ่มทั้งหมด {groups.length} กลุ่ม</p>
            <Button
              onClick={() => setShowGroupForm((v) => !v)}
              className="bg-[#5C3D1E] hover:bg-[#2C1810] text-white rounded-xl text-sm py-1.5 px-3 h-auto"
            >
              <Plus size={14} className="mr-1" />
              เพิ่มกลุ่ม
            </Button>
          </div>

          {showGroupForm && (
            <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4 mb-4">
              <h3 className="font-semibold text-[#5C3D1E] mb-3 text-sm">เพิ่มกลุ่มใหม่</h3>
              <form action={groupFormAction} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-[#5C3D1E]">ชื่อกลุ่ม</Label>
                  <Input name="name" placeholder="ชื่อกลุ่ม" required className="border-[#D4C4A8] rounded-xl text-sm" />
                </div>
                <Button type="submit" disabled={groupPending} className="w-full bg-[#5C3D1E] hover:bg-[#2C1810] text-white rounded-xl py-2 text-sm">
                  {groupPending ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
              </form>
            </div>
          )}


          <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F0E4] border-b border-[#D4C4A8] sticky top-0 z-10">
                    <th className="text-left px-4 py-2.5 font-semibold text-[#5C3D1E]">ชื่อกลุ่ม</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-[#5C3D1E]">สร้างเมื่อ</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((g, i) => (
                    <tr key={g.id} className={`border-b border-[#EDE3D0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}>
                      <td className="px-4 py-2.5 font-medium text-[#2C1810]">{g.name}</td>
                      <td className="px-4 py-2.5 text-xs text-[#A08060]">{formatThaiDate(new Date(g.createdAt))}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3 justify-end">
                          <button
                            onClick={() => { setEditGroupName(g.name); setDialog({ type: "editGroup", groupId: g.id, groupName: g.name }) }}
                            className="text-[#A08060] hover:text-[#5C3D1E] transition-colors"
                            title="แก้ไขชื่อกลุ่ม"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDialog({ type: "deleteGroup", groupId: g.id, groupName: g.name })}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="ลบกลุ่ม"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Entries Tab */}
      {tab === "entries" && (
        <div>
          <p className="text-sm text-[#A08060] mb-3">แสดงล่าสุด {entries.length} รายการ</p>
          <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-y-auto max-h-96">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F0E4] border-b border-[#D4C4A8] sticky top-0 z-10">
                    <th className="text-left px-3 py-2.5 font-semibold text-[#5C3D1E]">ชื่อ</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#5C3D1E]">กลุ่ม</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-[#5C3D1E]">น้ำหนัก</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-[#5C3D1E]">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.id} className={`border-b border-[#EDE3D0] last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}>
                      <td className="px-3 py-2.5 text-[#2C1810] font-medium">{e.userName}</td>
                      <td className="px-3 py-2.5 text-[#A08060] text-xs">{e.groupName}</td>
                      <td className="px-3 py-2.5 text-right font-bold text-[#5C3D1E]">{e.weight.toFixed(1)} กก.</td>
                      <td className="px-3 py-2.5 text-right text-[#A08060] text-xs">{formatThaiDate(new Date(e.recordedAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
