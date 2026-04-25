import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { THAI_MONTHS, toThaiYear } from "@/lib/calculations"
import { combineName } from "@/lib/names"
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
    select: {
      id: true,
      role: true,
      groupId: true,
      group: { select: { id: true, name: true } },
    },
  })
  if (!user) return null

  const allGroups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { users: true } } },
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
    select: {
      id: true,
      realName: true,
      firstName: true,
      lastName: true,
      weightEntries: {
        where: { recordedAt: { gte: monthStart, lte: monthEnd } },
        orderBy: { recordedAt: "asc" },
        select: { weight: true },
      },
      waistEntries: {
        where: { recordedAt: { gte: monthStart, lte: monthEnd } },
        orderBy: { recordedAt: "asc" },
        select: { waist: true },
      },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }, { realName: "asc" }],
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

      const displayName = combineName(m.firstName, m.lastName, m.realName)
      return {
        id: m.id,
        realName: displayName,
        initial: displayName[0]?.toUpperCase() ?? "?",
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
    if (change === null || count <= 1) return <span className="text-xs text-[#343A46]">—</span>
    return (
      <span
        className={`text-xs font-semibold ${change < 0 ? "text-green-600" : change > 0 ? "text-[#D08A8A]" : "text-[#A8AFBD]"}`}
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
        <div className="bg-[#171A20] border border-[#343A46] rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-[#F59E0B]">{user.group.name}</h2>
              <p className="text-xs text-[#A8AFBD] mt-0.5">ข้อมูลเดือน {monthName}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#F59E0B]">
                {memberCount}
                <span className="text-sm font-normal text-[#A8AFBD]">/10</span>
              </p>
              <p className="text-xs text-[#A8AFBD]">สมาชิก</p>
            </div>
          </div>
          <div className="w-full bg-[#242832] rounded-full h-2">
            <div
              className="bg-[#F59E0B] h-2 rounded-full transition-all"
              style={{ width: `${(memberCount / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Member table */}
        <div className="bg-[#171A20] border border-[#343A46] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#242832] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#F59E0B]">สมาชิกเดือนนี้</p>
              <p className="text-xs text-[#A8AFBD] mt-0.5">
                ค่าที่เปลี่ยน = ค่าล่าสุดของเดือน - ค่าแรกของเดือน
              </p>
            </div>
            <p className="text-xs text-[#A8AFBD]">{monthName}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1A1D23] border-b border-[#242832]">
                  <th className="text-left px-4 py-2.5 font-semibold text-[#A8AFBD] whitespace-nowrap">ชื่อ</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A8AFBD] whitespace-nowrap">น้ำหนักล่าสุด</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A8AFBD] whitespace-nowrap">น้ำหนักเปลี่ยน</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A8AFBD] whitespace-nowrap">รอบเอวล่าสุด</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[#A8AFBD] whitespace-nowrap">รอบเอวเปลี่ยน</th>
                </tr>
              </thead>
              <tbody>
                {memberStats.map((m, i) => (
                  <tr
                    key={m.id}
                    className={`border-b border-[#242832] last:border-0 ${
                      m.isMe ? "bg-[#0F1115]" : i % 2 === 0 ? "bg-[#171A20]" : "bg-[#0F1115]/40"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[#111318] ${
                            m.isMe ? "bg-[#E7EAF0]" : "bg-[#F59E0B]"
                          }`}
                        >
                          {m.initial}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#E7EAF0] whitespace-nowrap">
                            {m.realName}
                            {m.isMe && (
                              <span className="text-[10px] text-[#A8AFBD] ml-1 font-normal">(คุณ)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#A8AFBD]">
                            {m.weightEntryCount > 0 ? `${m.weightEntryCount} ครั้ง` : "ยังไม่บันทึก"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {m.lastWeight !== null ? (
                        <span className="text-sm font-bold text-[#F59E0B]">
                          {m.lastWeight.toFixed(1)}
                          <span className="text-xs font-normal text-[#A8AFBD]"> กก.</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#343A46]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <ChangeCell change={m.weightChange} count={m.weightEntryCount} />
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      {m.lastWaist !== null ? (
                        <span className="text-sm font-bold text-[#F59E0B]">
                          {m.lastWaist.toFixed(1)}
                          <span className="text-xs font-normal text-[#A8AFBD]"> ซม.</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#343A46]">—</span>
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

        <p className="text-center text-xs text-[#343A46]">
          ข้อมูลนับจากต้นเดือนถึงปัจจุบัน • เรียงตามน้ำหนักที่ลดได้มากที่สุด
        </p>

        {user.role === "ADMIN" && (
          <GroupManageSection
            currentGroupId={user.groupId}
            currentGroupName={user.group.name}
            groups={allGroups.map((g) => ({ id: g.id, name: g.name }))}
          />
        )}
      </div>
    </div>
  )
}
