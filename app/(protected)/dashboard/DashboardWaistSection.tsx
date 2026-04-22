"use client";

import { useMemo, useState } from "react";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import type { SeriesMeta } from "@/components/charts/HorizontalBarChart";
import DonutChart from "@/components/charts/DonutChart";
import type { DonutSlice } from "@/components/charts/DonutChart";
import {
  THAI_MONTHS_SHORT,
  toThaiYear,
  getUserMonthlyWeights,
} from "@/lib/calculations";
import type { SerializedGroupWithUsers } from "@/lib/calculations";

type TimeRange = "6" | "12" | "all";
type SortCol =
  | "name"
  | "firstWaist"
  | "latestWaist"
  | "change"
  | "percentChange";
type SortDir = "asc" | "desc";

const MAX_HISTORY_MONTHS = 36;

const GROUP_COLORS = [
  "#5C3D1E",
  "#A08060",
  "#C4956A",
  "#8B6914",
  "#6B4F2A",
  "#D4B896",
];

const SORT_COLS: {
  key: SortCol;
  label: string;
  optAsc?: string;
  optDesc?: string;
}[] = [
  {
    key: "change",
    label: "เรียงตามรอบเอวที่ลดลง",
    optAsc: "ลดลงมากที่สุดขึ้นก่อน",
    optDesc: "ลดลงน้อยที่สุดขึ้นก่อน",
  },
];

interface Props {
  allGroupsWaist: SerializedGroupWithUsers[];
  selectedGroupIds: string[];
  timeRange: TimeRange;
  userRole: string;
}

function getMonthlyTotal(
  users: SerializedGroupWithUsers["users"],
  month: string,
): number {
  let total = 0;
  for (const user of users) {
    const monthlyMap = getUserMonthlyWeights(user.weightEntries);
    const sortedMonths = [...monthlyMap.keys()].sort();
    let w: number | null = null;
    for (const m of sortedMonths) {
      if (m <= month) w = monthlyMap.get(m) ?? null;
    }
    if (w !== null) total += w;
  }
  return total;
}

export default function DashboardWaistSection({
  allGroupsWaist,
  selectedGroupIds,
  timeRange,
  userRole,
}: Props) {
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir } | null>({
    col: "change",
    dir: "asc",
  });

  const filteredWaist = useMemo(() => {
    if (selectedGroupIds.length === 0) return allGroupsWaist;
    return allGroupsWaist.filter((g) => selectedGroupIds.includes(g.id));
  }, [allGroupsWaist, selectedGroupIds]);

  const months = useMemo(() => {
    const result: string[] = [];
    const base = new Date();
    const back =
      timeRange === "6" ? 6 : timeRange === "12" ? 12 : MAX_HISTORY_MONTHS;
    for (let i = back - 1; i >= 0; i--) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      result.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      );
    }
    return result;
  }, [timeRange]);

  const latestMonth = months[months.length - 1] ?? "";
  const isMultiGroup = selectedGroupIds.length >= 2;

  const singleChartData = useMemo(() => {
    if (isMultiGroup) return [];
    return months.map((monthKey) => {
      const [yearStr, monthStr] = monthKey.split("-");
      const thaiLabel = `${THAI_MONTHS_SHORT[parseInt(monthStr ?? "1") - 1]} ${String(toThaiYear(parseInt(yearStr ?? "2024"))).slice(2)}`;
      let total = 0;
      for (const g of filteredWaist)
        total += getMonthlyTotal(g.users, monthKey);
      return { month: thaiLabel, total: parseFloat(total.toFixed(1)) };
    });
  }, [filteredWaist, months, isMultiGroup]);

  const { multiChartData, chartSeries } = useMemo((): {
    multiChartData: Record<string, string | number>[];
    chartSeries: SeriesMeta[];
  } => {
    if (!isMultiGroup) return { multiChartData: [], chartSeries: [] };
    const series: SeriesMeta[] = filteredWaist.map((g, i) => ({
      key: g.id,
      label: g.name,
      color: GROUP_COLORS[i % GROUP_COLORS.length]!,
    }));
    const multiData = months.map((monthKey) => {
      const [yearStr, monthStr] = monthKey.split("-");
      const thaiLabel = `${THAI_MONTHS_SHORT[parseInt(monthStr ?? "1") - 1]} ${String(toThaiYear(parseInt(yearStr ?? "2024"))).slice(2)}`;
      const point: Record<string, string | number> = { month: thaiLabel };
      for (const g of filteredWaist)
        point[g.id] = parseFloat(getMonthlyTotal(g.users, monthKey).toFixed(1));
      return point;
    });
    return { multiChartData: multiData, chartSeries: series };
  }, [filteredWaist, months, isMultiGroup]);

  const summaryStats = useMemo(() => {
    const allUsers = filteredWaist.flatMap((g) => g.users);
    if (allUsers.length === 0)
      return { prevMonthTotal: 0, latestTotal: 0, lostCm: 0, lostPercent: 0 };
    const allEntries = allUsers.flatMap((u) => u.weightEntries);
    if (allEntries.length === 0)
      return { prevMonthTotal: 0, latestTotal: 0, lostCm: 0, lostPercent: 0 };

    const earliest = allEntries.reduce((min, e) =>
      new Date(e.recordedAt) < new Date(min.recordedAt) ? e : min,
    );
    const periodStart = new Date(earliest.recordedAt);

    let startTotal = 0,
      latestTotal = 0;
    for (const user of allUsers) {
      const sorted = [...user.weightEntries].sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      );
      const inPeriod = sorted.filter(
        (e) => new Date(e.recordedAt) >= periodStart,
      );
      const startW =
        inPeriod.length > 0 ? inPeriod[0]!.weight : (sorted[0]?.weight ?? null);
      const latestW = sorted[sorted.length - 1]?.weight ?? null;
      if (startW !== null && latestW !== null) {
        startTotal += startW;
        latestTotal += latestW;
      }
    }

    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
    let prevMonthTotal = 0;
    for (const user of allUsers) {
      const monthlyMap = getUserMonthlyWeights(user.weightEntries);
      const sortedMonths = [...monthlyMap.keys()].sort();
      let w: number | null = null;
      for (const m of sortedMonths) {
        if (m <= prevMonthKey) w = monthlyMap.get(m) ?? null;
      }
      if (w !== null) prevMonthTotal += w;
    }

    const lostCm = parseFloat((startTotal - latestTotal).toFixed(2));
    const lostPercent =
      startTotal > 0 ? parseFloat(((lostCm / startTotal) * 100).toFixed(2)) : 0;
    return {
      prevMonthTotal: parseFloat(prevMonthTotal.toFixed(1)),
      latestTotal: parseFloat(latestTotal.toFixed(1)),
      lostCm,
      lostPercent,
    };
  }, [filteredWaist]);

  const donutData = useMemo((): DonutSlice[] => {
    if (!latestMonth) return [];
    const slices: DonutSlice[] = [];
    let totalCm = 0;
    for (const group of allGroupsWaist) {
      let groupCm = 0;
      for (const user of group.users) {
        const monthlyMap = getUserMonthlyWeights(user.weightEntries);
        const sortedMonths = [...monthlyMap.keys()].sort();
        let w: number | null = null;
        for (const m of sortedMonths) {
          if (m <= latestMonth) w = monthlyMap.get(m) ?? null;
        }
        if (w !== null) groupCm += w;
      }
      if (groupCm > 0) {
        slices.push({ name: group.name, kg: groupCm, percent: 0 });
        totalCm += groupCm;
      }
    }
    return slices.map((s) => ({
      ...s,
      kg: parseFloat(s.kg.toFixed(1)),
      percent:
        totalCm > 0 ? parseFloat(((s.kg / totalCm) * 100).toFixed(1)) : 0,
    }));
  }, [allGroupsWaist, latestMonth]);

  const individualStats = useMemo(() => {
    if (userRole !== "ADMIN") return [];
    return allGroupsWaist.flatMap((g) =>
      g.users.map((u) => {
        if (u.weightEntries.length === 0)
          return {
            id: u.id,
            name: u.realName,
            firstWaist: null,
            latestWaist: null,
            change: null,
            percentChange: null,
          };
        const sorted = [...u.weightEntries].sort(
          (a, b) =>
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
        );
        const first = sorted[0]!.weight;
        const latest = sorted[sorted.length - 1]!.weight;
        const change = parseFloat((latest - first).toFixed(2));
        return {
          id: u.id,
          name: u.realName,
          firstWaist: first,
          latestWaist: latest,
          change,
          percentChange: parseFloat(((change / first) * 100).toFixed(2)),
        };
      }),
    );
  }, [allGroupsWaist, userRole]);

  const sortedStats = useMemo(() => {
    if (!sort) return individualStats;
    return [...individualStats].sort((a, b) => {
      const aVal =
        sort.col === "firstWaist"
          ? a.firstWaist
          : sort.col === "latestWaist"
            ? a.latestWaist
            : sort.col === "change"
              ? a.change
              : sort.col === "percentChange"
                ? a.percentChange
                : null;
      const bVal =
        sort.col === "firstWaist"
          ? b.firstWaist
          : sort.col === "latestWaist"
            ? b.latestWaist
            : sort.col === "change"
              ? b.change
              : sort.col === "percentChange"
                ? b.percentChange
                : null;
      if (sort.col === "name") {
        const cmp = a.name.localeCompare(b.name, "th");
        return sort.dir === "asc" ? cmp : -cmp;
      }
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      const diff = aVal - bVal;
      return sort.dir === "asc" ? diff : -diff;
    });
  }, [individualStats, sort]);

  const summaryCards = [
    {
      label: "รอบเอวรวมเดือนที่แล้ว",
      value:
        summaryStats.prevMonthTotal > 0
          ? `${summaryStats.prevMonthTotal.toFixed(1)} ซม.`
          : "—",
    },
    {
      label: "รอบเอวล่าสุด",
      value: `${summaryStats.latestTotal.toFixed(1)} ซม.`,
    },
    {
      label:
        summaryStats.lostCm > 0
          ? "รอบเอวลดลง (ซม.)"
          : summaryStats.lostCm < 0
            ? "รอบเอวเพิ่มขึ้น (ซม.)"
            : "รอบเอวคงที่",
      value: `${Math.abs(summaryStats.lostCm).toFixed(1)} ซม.`,
      highlight: summaryStats.lostCm > 0,
      negative: summaryStats.lostCm < 0,
    },
    {
      label:
        summaryStats.lostPercent > 0
          ? "ลดลง %"
          : summaryStats.lostPercent < 0
            ? "เพิ่มขึ้น %"
            : "คงที่ %",
      value: `${Math.abs(summaryStats.lostPercent).toFixed(1)}%`,
      highlight: summaryStats.lostPercent > 0,
      negative: summaryStats.lostPercent < 0,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[#5C3D1E] mb-3">ภาพรวมรอบเอว</h2>
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4"
            >
              <p className="text-xs text-[#A08060] mb-1">{card.label}</p>
              <p
                className={`text-2xl font-bold ${card.highlight ? "text-green-600" : (card as { negative?: boolean }).negative ? "text-red-500" : "text-[#5C3D1E]"}`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {donutData.length > 0 && (
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-5">
          <h3 className="text-base font-semibold text-[#5C3D1E] mb-3">
            สัดส่วนรอบเอวรวมแต่ละกลุ่ม
          </h3>
          <DonutChart data={donutData} height={300} />
        </div>
      )}

      <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-4">
        <h3 className="font-semibold text-[#5C3D1E] mb-3 text-sm">
          รอบเอวรวมรายเดือน (ซม.)
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

      {userRole === "ADMIN" && individualStats.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-[#5C3D1E] mb-3">
            รอบเอวรายบุคคล
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 mb-3">
            {SORT_COLS.map((col) => (
              <div key={col.key} className="flex flex-col gap-1">
                <label className="text-xs text-[#A08060] font-medium truncate">
                  {col.label}
                </label>
                <select
                  value={sort?.col === col.key ? sort.dir : "none"}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "none") setSort(null);
                    else setSort({ col: col.key, dir: v as SortDir });
                  }}
                  className="text-xs border border-[#D4C4A8] rounded-lg px-2 py-1.5 bg-white text-[#5C3D1E] focus:outline-none cursor-pointer"
                >
                  <option value="none">ไม่เรียง</option>
                  <option value="asc">{col.optAsc ?? "น้อยไปมาก"}</option>
                  <option value="desc">{col.optDesc ?? "มากไปน้อย"}</option>
                </select>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-[#F7F0E4] border-b border-[#D4C4A8] sticky top-0 z-10">
                    <th className="text-left px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">
                      #
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">
                      ชื่อ
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">
                      รอบเอวเริ่มต้น
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">
                      รอบเอวล่าสุด
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">
                      เปลี่ยนแปลง (ซม.)
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#5C3D1E] whitespace-nowrap">
                      % เปลี่ยนแปลง
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-[#EDE3D0] last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"}`}
                    >
                      <td className="px-5 py-4 text-[#5C3D1E] font-bold whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-4 text-[#2C1810] font-medium whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="px-5 py-4 text-right text-[#2C1810] whitespace-nowrap">
                        {row.firstWaist !== null
                          ? row.firstWaist.toFixed(1)
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-right text-[#2C1810] whitespace-nowrap">
                        {row.latestWaist !== null
                          ? row.latestWaist.toFixed(1)
                          : "—"}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-medium whitespace-nowrap ${row.change === null ? "text-[#A08060]" : row.change < 0 ? "text-green-600" : row.change > 0 ? "text-red-500" : "text-[#2C1810]"}`}
                      >
                        {row.change !== null
                          ? `${row.change > 0 ? "+" : ""}${row.change.toFixed(2)}`
                          : "—"}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-bold whitespace-nowrap ${row.percentChange === null ? "text-[#A08060]" : row.percentChange < 0 ? "text-green-600" : row.percentChange > 0 ? "text-red-500" : "text-[#2C1810]"}`}
                      >
                        {row.percentChange !== null
                          ? `${row.percentChange > 0 ? "+" : ""}${row.percentChange.toFixed(2)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
