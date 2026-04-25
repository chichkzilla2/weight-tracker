"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import { getUserMonthlyWeights } from "@/lib/calculations";
import type { SerializedGroupWithUsers } from "@/lib/calculations";

type SortCol =
  | "name"
  | "firstWaist"
  | "latestWaist"
  | "change"
  | "percentChange";
type SortDir = "asc" | "desc";

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
  userRole: string;
}

const BAR_COLORS = ["#F59E0B", "#A8AFBD"];

function getGroupLatestTotal(users: SerializedGroupWithUsers["users"]) {
  let total = 0;
  let hasData = false;

  for (const user of users) {
    const sorted = [...user.weightEntries].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );
    const latest = sorted[0]?.weight ?? null;
    if (latest !== null) {
      total += latest;
      hasData = true;
    }
  }

  return hasData ? parseFloat(total.toFixed(1)) : null;
}

export default function DashboardWaistSection({
  allGroupsWaist,
  userRole,
}: Props) {
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir } | null>({
    col: "change",
    dir: "asc",
  });
  const [selectedWaistGroupIds, setSelectedWaistGroupIds] = useState<string[]>(
    () => allGroupsWaist.map((g) => g.id),
  );
  const [waistDropdownOpen, setWaistDropdownOpen] = useState(false);
  const waistFilterRef = useRef<HTMLDivElement>(null);

  const filteredWaist = useMemo(() => {
    return allGroupsWaist.filter((g) => selectedWaistGroupIds.includes(g.id));
  }, [allGroupsWaist, selectedWaistGroupIds]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!waistFilterRef.current?.contains(event.target as Node)) {
        setWaistDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupTotalData = useMemo(() => {
    return filteredWaist
      .map((group) => {
        const value = getGroupLatestTotal(group.users);
        return value === null ? null : { name: group.name, value };
      })
      .filter((row): row is { name: string; value: number } => row !== null)
      .sort((a, b) => b.value - a.value);
  }, [filteredWaist]);

  function toggleGroup(id: string) {
    setSelectedWaistGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAllGroups() {
    setSelectedWaistGroupIds((prev) =>
      prev.length === allGroupsWaist.length
        ? []
        : allGroupsWaist.map((g) => g.id),
    );
  }

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
        <h2 className="text-lg font-bold text-[#F59E0B] mb-3">ภาพรวมรอบเอว</h2>
        <p className="text-xs text-[#A8AFBD] mb-3">
          สรุปจากผลรวมรอบเอวเริ่มต้นของสมาชิก เทียบกับรอบเอวล่าสุด
          และคิดเปอร์เซ็นต์จากรอบเอวเริ่มต้น
        </p>
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="glass-card rounded-2xl p-4">
              <p className="text-xs text-[#A8AFBD] mb-1">{card.label}</p>
              <p
                className={`text-2xl font-bold ${card.highlight ? "text-green-600" : (card as { negative?: boolean }).negative ? "text-[#D08A8A]" : "text-[#F59E0B]"}`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div ref={waistFilterRef} className="relative w-full max-w-xs">
        <button
          type="button"
          onClick={() => setWaistDropdownOpen((v) => !v)}
          className="w-full border border-white/10 rounded-xl px-3 py-2 bg-[#171A20]/70 text-left text-sm text-[#F59E0B]"
        >
          {selectedWaistGroupIds.length === allGroupsWaist.length
            ? "ทุกกลุ่ม"
            : `เลือก ${selectedWaistGroupIds.length} กลุ่ม`}
        </button>
        {waistDropdownOpen && (
          <div className="absolute z-20 mt-1 w-full glass-card rounded-xl shadow-lg p-2 space-y-1">
            <label className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#F59E0B] cursor-pointer">
              <input
                type="checkbox"
                checked={selectedWaistGroupIds.length === allGroupsWaist.length}
                onChange={toggleAllGroups}
              />
              ทุกกลุ่ม
            </label>
            {allGroupsWaist.map((g) => (
              <label
                key={g.id}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#F59E0B] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedWaistGroupIds.includes(g.id)}
                  onChange={() => toggleGroup(g.id)}
                />
                {g.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-4">
        <h3 className="font-semibold text-[#F59E0B] mb-3 text-sm">
          รอบเอวรวมตามกลุ่ม
        </h3>
        <p className="text-xs text-[#A8AFBD] mb-3">
          แต่ละแท่งคือผลรวมรอบเอวล่าสุดของสมาชิกในกลุ่มที่เลือก
        </p>
        <HorizontalBarChart
          data={groupTotalData}
          unit=" ซม."
          endLabelKey="name"
          hideCategoryAxis
          barColors={groupTotalData.map(
            (_, index) => BAR_COLORS[index % BAR_COLORS.length]!,
          )}
        />
      </div>

      {userRole === "ADMIN" && individualStats.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-[#F59E0B] mb-3">
            รอบเอวรายบุคคล
          </h2>
          <p className="text-xs text-[#A8AFBD] mb-3">
            รอบเอวที่เปลี่ยนแปลง = รอบเอวล่าสุด - รอบเอวเริ่มต้น
            และเปอร์เซ็นต์คิดจากรอบเอวเริ่มต้น
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 mb-3">
            {SORT_COLS.map((col) => (
              <div key={col.key} className="flex flex-col gap-1">
                <label className="text-xs text-[#A8AFBD] font-medium truncate">
                  {col.label}
                </label>
                <select
                  value={sort?.col === col.key ? sort.dir : "none"}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "none") setSort(null);
                    else setSort({ col: col.key, dir: v as SortDir });
                  }}
                  className="text-xs border border-white/10 rounded-lg px-2 py-1.5 bg-[#171A20]/70 text-[#F59E0B] focus:outline-none cursor-pointer"
                >
                  <option value="none">ไม่เรียง</option>
                  <option value="asc">{col.optAsc ?? "น้อยไปมาก"}</option>
                  <option value="desc">{col.optDesc ?? "มากไปน้อย"}</option>
                </select>
              </div>
            ))}
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-[#000000] border-b border-white/10 sticky top-0 z-10">
                    <th className="text-left px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                      #
                    </th>
                    <th className="text-left px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                      ชื่อ
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                      รอบเอวเริ่มต้น
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                      รอบเอวล่าสุด
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                      เปลี่ยนแปลง (ซม.)
                    </th>
                    <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                      % เปลี่ยนแปลง
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-white/10 last:border-0 ${idx % 2 === 0 ? "bg-[#171A20]/70" : "bg-[#0F1115]/55"}`}
                    >
                      <td className="px-5 py-4 text-[#F59E0B] font-bold whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-4 text-[#E7EAF0] font-medium whitespace-nowrap">
                        {row.name}
                      </td>
                      <td className="px-5 py-4 text-right text-[#E7EAF0] whitespace-nowrap">
                        {row.firstWaist !== null
                          ? row.firstWaist.toFixed(1)
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-right text-[#E7EAF0] whitespace-nowrap">
                        {row.latestWaist !== null
                          ? row.latestWaist.toFixed(1)
                          : "—"}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-medium whitespace-nowrap ${row.change === null ? "text-[#A8AFBD]" : row.change < 0 ? "text-green-600" : row.change > 0 ? "text-[#D08A8A]" : "text-[#E7EAF0]"}`}
                      >
                        {row.change !== null
                          ? `${row.change > 0 ? "+" : ""}${row.change.toFixed(2)}`
                          : "—"}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-bold whitespace-nowrap ${row.percentChange === null ? "text-[#A8AFBD]" : row.percentChange < 0 ? "text-green-600" : row.percentChange > 0 ? "text-[#D08A8A]" : "text-[#E7EAF0]"}`}
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
