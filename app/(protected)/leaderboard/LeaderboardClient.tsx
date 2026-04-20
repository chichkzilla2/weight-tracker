"use client"

import { useState } from "react"
import type { LeaderboardEntry } from "@/lib/calculations"

interface MonthlyLeaderboard {
  monthKey: string
  label: string
  leaderboard: LeaderboardEntry[]
}

interface LeaderboardClientProps {
  monthlyLeaderboards: MonthlyLeaderboard[]
  currentMonthKey: string
  prevMonthKey: string
  currentGroupId: string | null
  lastUpdated: string
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"]

function LeaderboardTable({
  leaderboard,
  currentGroupId,
  filterMine,
}: {
  leaderboard: LeaderboardEntry[]
  currentGroupId: string | null
  filterMine: boolean
}) {
  const displayed = filterMine
    ? leaderboard.filter((e) => e.groupId === currentGroupId)
    : leaderboard

  return (
    <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-96">
      <table className="w-full text-base">
        <thead>
          <tr className="bg-[#F7F0E4] border-b border-[#D4C4A8] sticky top-0 z-10">
            <th className="text-left px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">#</th>
            <th className="text-left px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">ชื่อกลุ่ม</th>
            <th className="text-right px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">น้ำหนักรวม</th>
            <th className="text-right px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">ลดลง (กก.)</th>
            <th className="text-right px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">% ลด</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map((entry, idx) => {
            const globalRank = leaderboard.findIndex((e) => e.groupId === entry.groupId)
            const isMyGroup = entry.groupId === currentGroupId
            const medal = RANK_MEDALS[globalRank]

            return (
              <tr
                key={entry.groupId}
                className={`border-b border-[#EDE3D0] last:border-0 ${
                  isMyGroup
                    ? "bg-[#EDE3D0]"
                    : idx % 2 === 0
                    ? "bg-white"
                    : "bg-[#FDFAF5]"
                }`}
              >
                <td className="px-5 py-4 text-[#5C3D1E] font-bold whitespace-nowrap">
                  {medal ? (
                    <span className="text-2xl leading-none">{medal}</span>
                  ) : (
                    `${globalRank + 1}`
                  )}
                </td>
                <td className="px-5 py-4 text-[#2C1810] font-medium whitespace-nowrap">
                  {entry.groupName}
                  {isMyGroup && (
                    <span className="text-xs text-[#A08060] ml-1">(ของฉัน)</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right text-[#2C1810] whitespace-nowrap">
                  {entry.latestTotal.toFixed(1)}
                </td>
                <td className="px-5 py-4 text-right text-green-600 font-medium whitespace-nowrap">
                  {entry.lostKg > 0 ? "-" : ""}
                  {Math.abs(entry.lostKg).toFixed(1)}
                </td>
                <td className="px-5 py-4 text-right text-green-600 font-bold whitespace-nowrap">
                  {entry.lostPercent > 0 ? "-" : ""}
                  {Math.abs(entry.lostPercent).toFixed(1)}%
                </td>
              </tr>
            )
          })}
          {displayed.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-[#A08060]">
                ไม่มีข้อมูลเดือนนี้
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default function LeaderboardClient({
  monthlyLeaderboards,
  currentMonthKey,
  prevMonthKey,
  currentGroupId,
  lastUpdated,
}: LeaderboardClientProps) {
  const [groupTab, setGroupTab] = useState<"all" | "mine">("all")
  const [monthTab, setMonthTab] = useState<"current" | "prev" | "history">("current")
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>(
    monthlyLeaderboards[monthlyLeaderboards.length - 1]?.monthKey ?? ""
  )

  const filterMine = groupTab === "mine"
  const monthTabIndex = monthTab === "current" ? 0 : monthTab === "prev" ? 1 : 2
  const groupTabIndex = groupTab === "all" ? 0 : 1

  const currentData = monthlyLeaderboards.find((m) => m.monthKey === currentMonthKey)
  const prevData = monthlyLeaderboards.find((m) => m.monthKey === prevMonthKey)
  const historyData = monthlyLeaderboards.find((m) => m.monthKey === selectedHistoryMonth)

  const activeData =
    monthTab === "current"
      ? currentData
      : monthTab === "prev"
      ? prevData
      : historyData

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Month tab switcher */}
      <div className="relative flex bg-[#EDE3D0] rounded-xl p-1 mb-3">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-[#5C3D1E] shadow-sm pointer-events-none"
          style={{
            width: "calc((100% - 8px) / 3)",
            transform: `translateX(${monthTabIndex * 100}%)`,
            transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {(["current", "prev", "history"] as const).map((tab, i) => (
          <button
            key={tab}
            onClick={() => setMonthTab(tab)}
            className={`relative z-10 flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-200 ${
              monthTab === tab ? "text-white" : "text-[#A08060]"
            }`}
          >
            {i === 0 ? "เดือนนี้" : i === 1 ? "เดือนที่แล้ว" : "ประวัติ"}
          </button>
        ))}
      </div>

      {/* Month label */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#5C3D1E]">
          {monthTab === "current" && (currentData?.label ?? "ยังไม่มีข้อมูลเดือนนี้")}
          {monthTab === "prev" && (prevData?.label ?? "ยังไม่มีข้อมูลเดือนที่แล้ว")}
          {monthTab === "history" && historyData?.label}
        </p>

        {/* History month selector */}
        {monthTab === "history" && monthlyLeaderboards.length > 0 && (
          <select
            value={selectedHistoryMonth}
            onChange={(e) => setSelectedHistoryMonth(e.target.value)}
            className="text-xs border border-[#D4C4A8] rounded-lg px-2 py-1 bg-white text-[#5C3D1E] focus:outline-none cursor-pointer"
          >
            {[...monthlyLeaderboards].reverse().map((m) => (
              <option key={m.monthKey} value={m.monthKey}>
                {m.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Group filter */}
      <div className="relative flex bg-[#EDE3D0] rounded-xl p-1 mb-4">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-white shadow-sm pointer-events-none"
          style={{
            width: "calc((100% - 8px) / 2)",
            transform: `translateX(${groupTabIndex * 100}%)`,
            transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {(["all", "mine"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setGroupTab(tab)}
            className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 ${
              groupTab === tab ? "text-[#5C3D1E]" : "text-[#A08060]"
            }`}
          >
            {tab === "all" ? "ทุกกลุ่ม" : "กลุ่มของฉัน"}
          </button>
        ))}
      </div>

      {/* Table */}
      {activeData ? (
        <LeaderboardTable
          leaderboard={activeData.leaderboard}
          currentGroupId={currentGroupId}
          filterMine={filterMine}
        />
      ) : (
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm px-4 py-10 text-center text-[#A08060]">
          ไม่มีข้อมูลในช่วงเวลานี้
        </div>
      )}

      <p className="text-xs text-[#A08060] text-center mt-4">
        บันทึกล่าสุด: {lastUpdated}
      </p>
    </div>
  )
}
