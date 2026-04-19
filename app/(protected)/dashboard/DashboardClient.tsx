"use client"

import { useMemo, useState } from "react"
import HorizontalBarChart from "@/components/charts/HorizontalBarChart"
import type { SeriesMeta } from "@/components/charts/HorizontalBarChart"
import DonutChart from "@/components/charts/DonutChart"
import type { DonutSlice } from "@/components/charts/DonutChart"
import {
  THAI_MONTHS_SHORT,
  toThaiYear,
  getUserMonthlyWeights,
} from "@/lib/calculations"
import type { SerializedGroupWithUsers } from "@/lib/calculations"

interface EntryData {
  id: string
  weight: number
  recordedAt: string
}

interface UserData {
  id: string
  realName: string
  weightEntries: EntryData[]
}

interface GroupData {
  id: string
  name: string
  users: UserData[]
}

interface DashboardClientProps {
  groups: GroupData[]
  allGroups: SerializedGroupWithUsers[]
  userGroupId: string
}

type TimeRange = "6" | "12" | "all"

const MAX_HISTORY_MONTHS = 36

const GROUP_COLORS = ["#5C3D1E", "#A08060", "#C4956A", "#8B6914", "#6B4F2A", "#D4B896"]

function getUserStartingWeightNum(entries: EntryData[], periodStart: Date): number | null {
  if (entries.length === 0) return null
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )
  const inPeriod = sorted.filter((e) => new Date(e.recordedAt) >= periodStart)
  if (inPeriod.length > 0) return inPeriod[0]!.weight
  return sorted[0]!.weight
}

function getUserLatestWeightNum(entries: EntryData[]): number | null {
  if (entries.length === 0) return null
  const sorted = [...entries].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )
  return sorted[0]!.weight
}

function getGroupMonthlyTotalNum(users: UserData[], month: string): number {
  let total = 0
  for (const user of users) {
    const monthlyMap = new Map<string, number>()
    const sorted = [...user.weightEntries].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    for (const e of sorted) {
      const d = new Date(e.recordedAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      monthlyMap.set(key, e.weight)
    }

    let weight: number | null = null
    const sortedMonths = [...monthlyMap.keys()].sort()
    for (const m of sortedMonths) {
      if (m <= month) {
        weight = monthlyMap.get(m) ?? null
      }
    }
    if (weight !== null) total += weight
  }
  return total
}

export default function DashboardClient({
  groups,
  allGroups,
  userGroupId,
}: DashboardClientProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>("6")

  const filteredGroups = useMemo(() => {
    if (selectedGroupIds.length === 0) return groups
    return groups.filter((g) => selectedGroupIds.includes(g.id))
  }, [groups, selectedGroupIds])

  // Determine month range
  const months = useMemo(() => {
    const result: string[] = []
    const base = new Date()
    const back = timeRange === "6" ? 6 : timeRange === "12" ? 12 : MAX_HISTORY_MONTHS
    for (let i = back - 1; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1)
      result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
    }
    return result
  }, [timeRange])

  const latestMonth = months[months.length - 1] ?? ""

  const isMultiGroup = selectedGroupIds.length >= 2

  // Single-series chart data (0 or 1 group selected)
  const singleChartData = useMemo(() => {
    if (selectedGroupIds.length >= 2) return []
    return months.map((monthKey) => {
      const parts = monthKey.split("-")
      const monthStr = parts[1] ?? "1"
      const yearStr = parts[0] ?? "2024"
      const monthIdx = parseInt(monthStr) - 1
      const ceYear = parseInt(yearStr)
      const thaiLabel = `${THAI_MONTHS_SHORT[monthIdx]} ${String(toThaiYear(ceYear)).slice(2)}`

      let total = 0
      for (const group of filteredGroups) {
        total += getGroupMonthlyTotalNum(group.users, monthKey)
      }

      return { month: thaiLabel, total: parseFloat(total.toFixed(1)) }
    })
  }, [filteredGroups, months, selectedGroupIds.length])

  // Multi-series chart data (2+ groups selected)
  const { multiChartData, chartSeries } = useMemo((): {
    multiChartData: Record<string, string | number>[]
    chartSeries: SeriesMeta[]
  } => {
    if (selectedGroupIds.length < 2) return { multiChartData: [], chartSeries: [] }

    const series: SeriesMeta[] = filteredGroups.map((g, i) => ({
      key: g.id,
      label: g.name,
      color: GROUP_COLORS[i % GROUP_COLORS.length]!,
    }))

    const multiData = months.map((monthKey) => {
      const parts = monthKey.split("-")
      const monthStr = parts[1] ?? "1"
      const yearStr = parts[0] ?? "2024"
      const monthIdx = parseInt(monthStr) - 1
      const ceYear = parseInt(yearStr)
      const thaiLabel = `${THAI_MONTHS_SHORT[monthIdx]} ${String(toThaiYear(ceYear)).slice(2)}`

      const point: Record<string, string | number> = { month: thaiLabel }
      for (const group of filteredGroups) {
        point[group.id] = parseFloat(getGroupMonthlyTotalNum(group.users, monthKey).toFixed(1))
      }
      return point
    })

    return { multiChartData: multiData, chartSeries: series }
  }, [filteredGroups, months, selectedGroupIds.length])

  // Summary stats — affected by group filter
  const summaryStats = useMemo(() => {
    const allUsers = filteredGroups.flatMap((g) => g.users)
    if (allUsers.length === 0) {
      return { startTotal: 0, latestTotal: 0, lostKg: 0, lostPercent: 0, prevMonthTotal: 0 }
    }

    const allEntries = allUsers.flatMap((u) => u.weightEntries)
    if (allEntries.length === 0) {
      return { startTotal: 0, latestTotal: 0, lostKg: 0, lostPercent: 0, prevMonthTotal: 0 }
    }

    const earliest = allEntries.reduce((min, e) =>
      new Date(e.recordedAt) < new Date(min.recordedAt) ? e : min
    )
    const periodStart = new Date(earliest.recordedAt)

    let startTotal = 0
    let latestTotal = 0

    for (const user of allUsers) {
      const startW = getUserStartingWeightNum(user.weightEntries, periodStart)
      const latestW = getUserLatestWeightNum(user.weightEntries)
      if (startW !== null && latestW !== null) {
        startTotal += startW
        latestTotal += latestW
      }
    }

    const lostKg = parseFloat((startTotal - latestTotal).toFixed(2))
    const lostPercent = startTotal > 0 ? parseFloat(((lostKg / startTotal) * 100).toFixed(2)) : 0

    // Previous calendar month key
    const now = new Date()
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`

    let prevMonthTotal = 0
    for (const group of filteredGroups) {
      for (const user of group.users) {
        const monthlyMap = getUserMonthlyWeights(user.weightEntries)
        const sortedMonths = [...monthlyMap.keys()].sort()
        let w: number | null = null
        for (const m of sortedMonths) {
          if (m <= prevMonthKey) w = monthlyMap.get(m) ?? null
        }
        if (w !== null) prevMonthTotal += w
      }
    }

    return {
      startTotal: parseFloat(startTotal.toFixed(1)),
      latestTotal: parseFloat(latestTotal.toFixed(1)),
      lostKg,
      lostPercent,
      prevMonthTotal,
    }
  }, [filteredGroups])

  // Donut data — always uses allGroups, unaffected by group filter
  const donutData = useMemo((): DonutSlice[] => {
    if (!latestMonth) return []
    const slices: DonutSlice[] = []
    let totalKg = 0

    for (const group of allGroups) {
      let groupKg = 0
      for (const user of group.users) {
        const monthlyMap = getUserMonthlyWeights(user.weightEntries)
        const sortedMonths = [...monthlyMap.keys()].sort()
        let w: number | null = null
        for (const m of sortedMonths) {
          if (m <= latestMonth) w = monthlyMap.get(m) ?? null
        }
        if (w !== null) groupKg += w
      }
      if (groupKg > 0) {
        slices.push({ name: group.name, kg: groupKg, percent: 0 })
        totalKg += groupKg
      }
    }

    return slices.map((s) => ({
      ...s,
      kg: parseFloat(s.kg.toFixed(1)),
      percent: totalKg > 0 ? parseFloat(((s.kg / totalKg) * 100).toFixed(1)) : 0,
    }))
  }, [allGroups, latestMonth])

  const summaryCards = [
    {
      label: "น้ำหนักรวมเดือนที่แล้ว",
      value: `${summaryStats.prevMonthTotal.toFixed(1)} กก.`,
    },
    { label: "น้ำหนักล่าสุด", value: `${summaryStats.latestTotal.toFixed(1)} กก.` },
    {
      label: "ลดลง (กก.)",
      value: `${summaryStats.lostKg > 0 ? "-" : ""}${Math.abs(summaryStats.lostKg).toFixed(1)} กก.`,
      highlight: summaryStats.lostKg > 0,
    },
    {
      label: "ลดลง %",
      value: `${summaryStats.lostPercent > 0 ? "-" : ""}${Math.abs(summaryStats.lostPercent).toFixed(1)}%`,
      highlight: summaryStats.lostPercent > 0,
    },
  ]

  function toggleGroup(id: string) {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div>
          <h2 className="text-lg font-bold text-[#5C3D1E] mb-3">ภาพรวมทั้งหมด</h2>
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4"
              >
                <p className="text-xs text-[#A08060] mb-1">{card.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    card.highlight ? "text-green-600" : "text-[#5C3D1E]"
                  }`}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart — always shown, unaffected by group filter */}
        {donutData.length > 0 && (
          <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-5">
            <h3 className="text-base font-semibold text-[#5C3D1E] mb-3">
              สัดส่วนน้ำหนักรวมแต่ละกลุ่ม
            </h3>
            <DonutChart data={donutData} height={300} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3">
          {/* Multi-select group pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGroupIds([])}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedGroupIds.length === 0
                  ? "bg-[#5C3D1E] text-white"
                  : "bg-[#EDE3D0] text-[#A08060] hover:text-[#5C3D1E]"
              }`}
            >
              ทุกกลุ่ม
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => toggleGroup(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedGroupIds.includes(g.id)
                    ? "bg-[#5C3D1E] text-white"
                    : "bg-[#EDE3D0] text-[#A08060] hover:text-[#5C3D1E]"
                }`}
              >
                {g.name}
                {g.id === userGroupId ? " ★" : ""}
              </button>
            ))}
          </div>
          {/* Time range */}
          <div className="flex bg-[#EDE3D0] rounded-xl p-0.5 gap-0.5 self-start">
            {(["6", "12", "all"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  timeRange === range
                    ? "bg-[#5C3D1E] text-white"
                    : "text-[#A08060] hover:text-[#5C3D1E]"
                }`}
              >
                {range === "all" ? "ทั้งหมด" : `${range} เดือน`}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly weight chart — affected by group filter */}
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-[#5C3D1E] mb-3 text-sm">
            น้ำหนักรวมรายเดือน (กก.)
          </h3>
          {isMultiGroup ? (
            <HorizontalBarChart
              multiData={[...multiChartData].reverse()}
              series={chartSeries}
            />
          ) : (
            <HorizontalBarChart data={[...singleChartData].reverse()} />
          )}
        </div>
      </div>
    </div>
  )
}
