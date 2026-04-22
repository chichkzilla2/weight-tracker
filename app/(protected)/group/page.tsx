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
      waistEntries: {
        where: { recordedAt: { gte: monthStart, lte: monthEnd } },
        orderBy: { recordedAt: "asc" },
      },
    },
    orderBy: { realName: "asc" },
  })

  const memberStats = members
    .map((m) => {
      const wEntries = m.weightEntries
      const firstWeight = wEntries[0] ? parseFloat(wEntries[0].weight.toString()) : null
      const lastWeight = wEntries[wEntries.length - 1]
        ? parseFloat(wEntries[wEntries.length - 1]!.weight.toString())
        : null
      const weightChange =
        firstWeight !== null && lastWeight !== null ? lastWeight - firstWeight : null

      const waEntries = m.waistEntries
      const firstWaist = waEntries[0] ? parseFloat(waEntries[0].waist.toString()) : null
      const lastWaist = waEntries[waEntries.length - 1]
        ? parseFloat(waEntries[waEntries.length - 1]!.waist.toString())
        : null
      const waistChange =
        firstWaist !== null && lastWaist !== null ? lastWaist - firstWaist : null

      return {
        id: m.id,
        realName: m.realName,
        initial: m.realName[0]?.toUpperCase() ?? "?",
        firstWeight,
        lastWeight,
        weightChange,
        weightEntryCount: wEntries.length,
        firstWaist,
        lastWaist,
        waistChange,
        waistEntryCount: waEntries.length,
        isMe: m.id === session.user.id,
      }
    })
    .sort((a, b) => {
      if (a.lastWeight !== null && b.lastWeight === null) return -1
      if (a.lastWeight === null && b.lastWeight !== null) return 1
      if (a.weightChange !== null && b.weightChange !== null) return a.weightChange - b.weightChange
      return 0
    })

  const memberCount = members.length

  function ChangeCell({ change, count }: { change: number | null; count: number }) {
    if (change === null || count <= 1) return <span className="text-xs text-[#D4C4A8]">—</span>
    return (
      <span
        className={`text-xs font-semibold ${change < 0 ? "text-green-600" : change > 0 ? "text-red-500" : "text-[#A08060]"}`}
      >
        {change < 0 ? "▼" : change > 0 ? "▲" : "—"}{" "}
        {change !== 0 ? Math.abs(change).toFixed(1) : ""}
      </span>
    )
  }

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

        {/* Member table */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#EDE3D0] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#5C3D1E]">สมาชิกเดือนนี้</p>
            <p className="text-xs text-[#A08060]">{monthName}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F7F0E4] border-b border-[#EDE3D0]">
                  <th className="text-left px-4 py-2.5 font-semibold text-[#A08060] whitespace-nowrap">ชื่อ</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A08060] whitespace-nowrap">น้ำหนักล่าสุด</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A08060] whitespace-nowrap">น้ำหนักเปลี่ยน</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A08060] whitespace-nowrap">รอบเอวล่าสุด</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A08060] whitespace-nowrap">รอบเอวเปลี่ยน</th>
                </tr>
              </thead>
              <tbody>
                {memberStats.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`border-b border-[#EDE3D0] last:border-0 ${
                      m.isMe ? "bg-[#FDFAF5]" : i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]/40"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            m.isMe ? "bg-[#2C1810]" : "bg-[#5C3D1E]"
                          }`}
                        >
                          {m.initial}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2C1810] whitespace-nowrap">
                            {m.realName}
                            {m.isMe && (
                              <span className="text-[10px] text-[#A08060] ml-1 font-normal">(คุณ)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#A08060]">
                            {m.weightEntryCount > 0 ? `${m.weightEntryCount} ครั้ง` : "ยังไม่บันทึก"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {m.lastWeight !== null ? (
                        <span className="text-sm font-bold text-[#5C3D1E]">
                          {m.lastWeight.toFixed(1)}
                          <span className="text-xs font-normal text-[#A08060]"> กก.</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#D4C4A8]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <ChangeCell change={m.weightChange} count={m.weightEntryCount} />
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {m.lastWaist !== null ? (
                        <span className="text-sm font-bold text-[#5C3D1E]">
                          {m.lastWaist.toFixed(1)}
                          <span className="text-xs font-normal text-[#A08060]"> ซม.</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#D4C4A8]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <ChangeCell change={m.waistChange} count={m.waistEntryCount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-xs text-[#D4C4A8]">
          ข้อมูลนับจากต้นเดือนถึงปัจจุบัน • เรียงตามน้ำหนักที่ลดได้มากที่สุด
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
