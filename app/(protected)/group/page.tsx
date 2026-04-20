import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { THAI_MONTHS, toThaiYear } from "@/lib/calculations"
import PageHeader from "@/components/shared/PageHeader"
import GroupJoinView from "./GroupJoinView"
import GroupManageSection from "./GroupManageSection"

export default async function GroupPage() {
  const session = await auth()
  if (!session) return null

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const monthName = `${THAI_MONTHS[now.getMonth()]} ${toThaiYear(now.getFullYear())}`

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { group: true },
  })
  if (!user) return null

  const allGroups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  })

  if (!user.groupId || !user.group) {
    return (
      <GroupJoinView
        groups={allGroups.map((g) => ({ id: g.id, name: g.name, memberCount: g._count.users }))}
      />
    )
  }

  const members = await prisma.user.findMany({
    where: { groupId: user.groupId },
    include: {
      weightEntries: {
        where: { recordedAt: { gte: monthStart, lte: monthEnd } },
        orderBy: { recordedAt: "asc" },
      },
    },
    orderBy: { realName: "asc" },
  })

  const memberStats = members
    .map((m) => {
      const entries = m.weightEntries
      const firstWeight = entries[0] ? parseFloat(entries[0].weight.toString()) : null
      const lastWeight = entries[entries.length - 1]
        ? parseFloat(entries[entries.length - 1]!.weight.toString())
        : null
      const change =
        firstWeight !== null && lastWeight !== null ? lastWeight - firstWeight : null
      return {
        id: m.id,
        realName: m.realName,
        initial: m.realName[0]?.toUpperCase() ?? "?",
        firstWeight,
        lastWeight,
        change,
        entryCount: entries.length,
        isMe: m.id === session.user.id,
      }
    })
    .sort((a, b) => {
      if (a.lastWeight !== null && b.lastWeight === null) return -1
      if (a.lastWeight === null && b.lastWeight !== null) return 1
      if (a.change !== null && b.change !== null) return a.change - b.change
      return 0
    })

  const memberCount = members.length

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="👥 กลุ่มของฉัน" subtitle={user.group.name} />
      <div className="px-4 pb-6 space-y-4">

        {/* Group info card */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#5C3D1E]">{user.group.name}</h2>
              <p className="text-xs text-[#A08060] mt-0.5">ข้อมูลเดือน {monthName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#5C3D1E]">
                {memberCount}
                <span className="text-sm font-normal text-[#A08060]">/10</span>
              </p>
              <p className="text-xs text-[#A08060]">สมาชิก</p>
            </div>
          </div>
          <div className="w-full bg-[#EDE3D0] rounded-full h-2">
            <div
              className="bg-[#5C3D1E] h-2 rounded-full transition-all"
              style={{ width: `${(memberCount / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Member weight table */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EDE3D0] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#5C3D1E]">น้ำหนักสมาชิกเดือนนี้</p>
            <p className="text-xs text-[#A08060]">{monthName}</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 bg-[#F7F0E4] border-b border-[#EDE3D0] text-xs font-semibold text-[#A08060]">
            <span>ชื่อ</span>
            <span className="text-right">น้ำหนักล่าสุด</span>
            <span className="text-right w-14">เปลี่ยนแปลง</span>
          </div>

          <div className="divide-y divide-[#EDE3D0]">
            {memberStats.map((m) => (
              <div
                key={m.id}
                className={`grid grid-cols-[1fr_auto_auto] gap-2 items-center px-4 py-3 ${m.isMe ? "bg-[#FDFAF5]" : ""}`}
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${m.isMe ? "bg-[#2C1810]" : "bg-[#5C3D1E]"}`}>
                    {m.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#2C1810] truncate">
                      {m.realName}
                      {m.isMe && <span className="text-[10px] text-[#A08060] ml-1 font-normal">(คุณ)</span>}
                    </p>
                    <p className="text-[10px] text-[#A08060]">
                      {m.entryCount > 0 ? `${m.entryCount} ครั้ง` : "ยังไม่บันทึก"}
                    </p>
                  </div>
                </div>

                {/* Latest weight */}
                <div className="text-right">
                  {m.lastWeight !== null ? (
                    <span className="text-sm font-bold text-[#5C3D1E]">
                      {m.lastWeight.toFixed(1)}<span className="text-xs font-normal text-[#A08060]"> กก.</span>
                    </span>
                  ) : (
                    <span className="text-xs text-[#D4C4A8]">—</span>
                  )}
                </div>

                {/* Change */}
                <div className="text-right w-14">
                  {m.change !== null && m.entryCount > 1 ? (
                    <span className={`text-xs font-semibold ${m.change < 0 ? "text-green-600" : m.change > 0 ? "text-red-500" : "text-[#A08060]"}`}>
                      {m.change < 0 ? "▼" : m.change > 0 ? "▲" : "—"}{" "}
                      {m.change !== 0 ? Math.abs(m.change).toFixed(1) : ""}
                    </span>
                  ) : (
                    <span className="text-xs text-[#D4C4A8]">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-[#D4C4A8]">
          ข้อมูลน้ำหนักนับจากต้นเดือนถึงปัจจุบัน • เรียงตามน้ำหนักที่ลดได้มากที่สุด
        </p>

        <GroupManageSection
          currentGroupId={user.groupId}
          currentGroupName={user.group.name}
          groups={allGroups.map((g) => ({ id: g.id, name: g.name }))}
        />
      </div>
    </div>
  )
}
