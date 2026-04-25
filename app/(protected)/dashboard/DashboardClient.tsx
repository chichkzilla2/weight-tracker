"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HorizontalBarChart from "@/components/charts/HorizontalBarChart";
import { getUserMonthlyWeights } from "@/lib/calculations";
import type { SerializedGroupWithUsers } from "@/lib/calculations";
import DashboardWaistSection from "./DashboardWaistSection";

interface EntryData {
  id: string;
  weight: number;
  recordedAt: string;
}

interface UserData {
  id: string;
  realName: string;
  weightEntries: EntryData[];
}

interface GroupData {
  id: string;
  name: string;
  users: UserData[];
}

interface DashboardClientProps {
  groups: GroupData[];
  allGroups: SerializedGroupWithUsers[];
  userGroupId: string | null;
  userRole: string;
  allGroupsWaist: SerializedGroupWithUsers[];
}

type SortCol =
  | "name"
  | "firstWeight"
  | "latestWeight"
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
    label: "เรียงตามน้ำหนักที่ลดลง",
    optAsc: "ลดลงมากที่สุดขึ้นก่อน",
    optDesc: "ลดลงน้อยที่สุดขึ้นก่อน",
  },
];

function getUserStartingWeightNum(
  entries: EntryData[],
  periodStart: Date,
): number | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
  const inPeriod = sorted.filter((e) => new Date(e.recordedAt) >= periodStart);
  if (inPeriod.length > 0) return inPeriod[0]!.weight;
  return sorted[0]!.weight;
}

function getUserLatestWeightNum(entries: EntryData[]): number | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort(
    (a, b) =>
      new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
  );
  return sorted[0]!.weight;
}

const BAR_COLORS = ["#F59E0B", "#A8AFBD"];

function getGroupLatestTotal(users: UserData[]) {
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

export default function DashboardClient({
  groups,
  allGroups,
  userGroupId,
  userRole,
  allGroupsWaist,
}: DashboardClientProps) {
  const [selectedWeightGroupIds, setSelectedWeightGroupIds] = useState<
    string[]
  >(() => groups.map((g) => g.id));
  const [weightDropdownOpen, setWeightDropdownOpen] = useState(false);
  const weightFilterRef = useRef<HTMLDivElement>(null);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => selectedWeightGroupIds.includes(g.id));
  }, [groups, selectedWeightGroupIds]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!weightFilterRef.current?.contains(event.target as Node)) {
        setWeightDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groupTotalData = useMemo(() => {
    return filteredGroups
      .map((group) => {
        const value = getGroupLatestTotal(group.users);
        return value === null ? null : { name: group.name, value };
      })
      .filter((row): row is { name: string; value: number } => row !== null)
      .sort((a, b) => b.value - a.value);
  }, [filteredGroups]);

  // Summary stats — affected by group filter
  const summaryStats = useMemo(() => {
    const allUsers = filteredGroups.flatMap((g) => g.users);
    if (allUsers.length === 0) {
      return {
        startTotal: 0,
        latestTotal: 0,
        lostKg: 0,
        lostPercent: 0,
        prevMonthTotal: 0,
      };
    }

    const allEntries = allUsers.flatMap((u) => u.weightEntries);
    if (allEntries.length === 0) {
      return {
        startTotal: 0,
        latestTotal: 0,
        lostKg: 0,
        lostPercent: 0,
        prevMonthTotal: 0,
      };
    }

    const earliest = allEntries.reduce((min, e) =>
      new Date(e.recordedAt) < new Date(min.recordedAt) ? e : min,
    );
    const periodStart = new Date(earliest.recordedAt);

    let startTotal = 0;
    let latestTotal = 0;

    for (const user of allUsers) {
      const startW = getUserStartingWeightNum(user.weightEntries, periodStart);
      const latestW = getUserLatestWeightNum(user.weightEntries);
      if (startW !== null && latestW !== null) {
        startTotal += startW;
        latestTotal += latestW;
      }
    }

    const lostKg = parseFloat((startTotal - latestTotal).toFixed(2));
    const lostPercent =
      startTotal > 0 ? parseFloat(((lostKg / startTotal) * 100).toFixed(2)) : 0;

    // Previous calendar month key
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

    let prevMonthTotal = 0;
    for (const group of filteredGroups) {
      for (const user of group.users) {
        const monthlyMap = getUserMonthlyWeights(user.weightEntries);
        const sortedMonths = [...monthlyMap.keys()].sort();
        let w: number | null = null;
        for (const m of sortedMonths) {
          if (m <= prevMonthKey) w = monthlyMap.get(m) ?? null;
        }
        if (w !== null) prevMonthTotal += w;
      }
    }

    return {
      startTotal: parseFloat(startTotal.toFixed(1)),
      latestTotal: parseFloat(latestTotal.toFixed(1)),
      lostKg,
      lostPercent,
      prevMonthTotal,
    };
  }, [filteredGroups]);

  // Individual user stats for admin table
  const individualStats = useMemo(() => {
    if (userRole !== "ADMIN") return [];
    const result: Array<{
      id: string;
      name: string;
      firstWeight: number | null;
      latestWeight: number | null;
      change: number | null;
      percentChange: number | null;
    }> = [];

    for (const group of allGroups) {
      for (const user of group.users) {
        if (user.weightEntries.length === 0) {
          result.push({
            id: user.id,
            name: user.realName,
            firstWeight: null,
            latestWeight: null,
            change: null,
            percentChange: null,
          });
          continue;
        }
        const sorted = [...user.weightEntries].sort(
          (a, b) =>
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
        );
        const firstWeight = sorted[0]!.weight;
        const latestWeight = sorted[sorted.length - 1]!.weight;
        const change = parseFloat((latestWeight - firstWeight).toFixed(2));
        const percentChange = parseFloat(
          ((change / firstWeight) * 100).toFixed(2),
        );
        result.push({
          id: user.id,
          name: user.realName,
          firstWeight,
          latestWeight,
          change,
          percentChange,
        });
      }
    }

    return result;
  }, [allGroups, userRole]);

  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir } | null>({
    col: "change",
    dir: "asc",
  });

  const sortedStats = useMemo(() => {
    if (!sort) return individualStats;
    return [...individualStats].sort((a, b) => {
      const aVal = a[sort.col];
      const bVal = b[sort.col];
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      if (sort.col === "name") {
        const cmp = (aVal as string).localeCompare(bVal as string, "th");
        return sort.dir === "asc" ? cmp : -cmp;
      }
      const diff = (aVal as number) - (bVal as number);
      return sort.dir === "asc" ? diff : -diff;
    });
  }, [individualStats, sort]);

  function handleSortChange(col: SortCol, value: string) {
    if (value === "none") setSort(null);
    else setSort({ col, dir: value as SortDir });
  }

  const summaryCards = [
    {
      label: "น้ำหนักรวมเดือนที่แล้ว",
      value:
        summaryStats.prevMonthTotal > 0
          ? `${summaryStats.prevMonthTotal.toFixed(1)} กก.`
          : "—",
    },
    {
      label: "น้ำหนักล่าสุด",
      value: `${summaryStats.latestTotal.toFixed(1)} กก.`,
    },
    {
      label:
        summaryStats.lostKg > 0
          ? "น้ำหนักรวมลดลง (กก.)"
          : summaryStats.lostKg < 0
            ? "น้ำหนักรวมเพิ่มขึ้น (กก.)"
            : "น้ำหนักรวมคงที่",
      value: `${Math.abs(summaryStats.lostKg).toFixed(1)} กก.`,
      highlight: summaryStats.lostKg > 0,
      negative: summaryStats.lostKg < 0,
    },
    {
      label:
        summaryStats.lostPercent > 0
          ? "น้ำหนักรวมลดลง %"
          : summaryStats.lostPercent < 0
            ? "น้ำหนักรวมเพิ่มขึ้น %"
            : "น้ำหนักรวมคงที่ %",
      value: `${Math.abs(summaryStats.lostPercent).toFixed(1)}%`,
      highlight: summaryStats.lostPercent > 0,
      negative: summaryStats.lostPercent < 0,
    },
  ];

  function toggleGroup(id: string) {
    setSelectedWeightGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAllGroups() {
    setSelectedWeightGroupIds((prev) =>
      prev.length === groups.length ? [] : groups.map((g) => g.id),
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="space-y-5">
        {/* Summary Cards */}
        <div>
          <h2 className="text-lg font-bold text-[#F59E0B] mb-3">
            ภาพรวมทั้งหมด
          </h2>
          <p className="text-xs text-[#A8AFBD] mb-3">
            สรุปจากผลรวมน้ำหนักเริ่มต้นของสมาชิก เทียบกับน้ำหนักล่าสุด
            และคิดเปอร์เซ็นต์จากน้ำหนักเริ่มต้น
          </p>
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((card) => (
              <div key={card.label} className="glass-card rounded-2xl p-4">
                <p className="text-xs text-[#A8AFBD] mb-1">{card.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    card.highlight
                      ? "text-green-600"
                      : (card as { negative?: boolean }).negative
                        ? "text-[#D08A8A]"
                        : "text-[#F59E0B]"
                  }`}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div ref={weightFilterRef} className="relative w-full max-w-xs">
            <button
              type="button"
              onClick={() => setWeightDropdownOpen((v) => !v)}
              className="w-full border border-white/10 rounded-xl px-3 py-2 bg-[#171A20]/70 text-left text-sm text-[#F59E0B]"
            >
              {selectedWeightGroupIds.length === groups.length
                ? "ทุกกลุ่ม"
                : `เลือก ${selectedWeightGroupIds.length} กลุ่ม`}
            </button>
            {weightDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full glass-card rounded-xl shadow-lg p-2 space-y-1">
                <label className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#F59E0B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWeightGroupIds.length === groups.length}
                    onChange={toggleAllGroups}
                  />
                  ทุกกลุ่ม
                </label>
                {groups.map((g) => (
                  <label
                    key={g.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm text-[#F59E0B] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedWeightGroupIds.includes(g.id)}
                      onChange={() => toggleGroup(g.id)}
                    />
                    {g.name}
                    {g.id === userGroupId ? " ★" : ""}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weight group percentage chart — affected by group filter */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="font-semibold text-[#F59E0B] mb-3 text-sm">
            น้ำหนักรวมตามกลุ่ม
          </h3>
          <p className="text-xs text-[#A8AFBD] mb-3">
            แต่ละแท่งคือผลรวมน้ำหนักล่าสุดของสมาชิกในกลุ่มที่เลือก
          </p>
          <HorizontalBarChart
            data={groupTotalData}
            unit=" กก."
            endLabelKey="name"
            hideCategoryAxis
            barColors={groupTotalData.map(
              (_, index) => BAR_COLORS[index % BAR_COLORS.length]!,
            )}
          />
        </div>

        {/* Admin-only individual weight table */}
        {userRole === "ADMIN" && individualStats.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-[#F59E0B] mb-3">
              น้ำหนักรายบุคคล
            </h2>
            <p className="text-xs text-[#A8AFBD] mb-3">
              น้ำหนักที่เปลี่ยนแปลง = น้ำหนักล่าสุด - น้ำหนักเริ่มต้น
              และเปอร์เซ็นต์คิดจากน้ำหนักเริ่มต้น
            </p>

            {/* Sort controls */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2 mb-3">
              {SORT_COLS.map((col) => (
                <div key={col.key} className="flex flex-col gap-1">
                  <label className="text-xs text-[#A8AFBD] font-medium truncate">
                    {col.label}
                  </label>
                  <select
                    value={sort?.col === col.key ? sort.dir : "none"}
                    onChange={(e) => handleSortChange(col.key, e.target.value)}
                    className="text-xs border border-white/10 rounded-lg pl-2 py-1.5 bg-[#171A20]/70 text-[#F59E0B] focus:outline-none cursor-pointer"
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
                        น้ำหนักเริ่มต้น
                      </th>
                      <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                        น้ำหนักล่าสุด
                      </th>
                      <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                        เปลี่ยนแปลง (กก.)
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
                        className={`border-b border-white/10 last:border-0 ${
                          idx % 2 === 0 ? "bg-[#171A20]/70" : "bg-[#0F1115]/55"
                        }`}
                      >
                        <td className="px-5 py-4 text-[#F59E0B] font-bold whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-4 text-[#E7EAF0] font-medium whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className="px-5 py-4 text-right text-[#E7EAF0] whitespace-nowrap">
                          {row.firstWeight !== null
                            ? `${row.firstWeight.toFixed(1)}`
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-right text-[#E7EAF0] whitespace-nowrap">
                          {row.latestWeight !== null
                            ? `${row.latestWeight.toFixed(1)}`
                            : "—"}
                        </td>
                        <td
                          className={`px-5 py-4 text-right font-medium whitespace-nowrap ${
                            row.change === null
                              ? "text-[#A8AFBD]"
                              : row.change < 0
                                ? "text-green-600"
                                : row.change > 0
                                  ? "text-[#D08A8A]"
                                  : "text-[#E7EAF0]"
                          }`}
                        >
                          {row.change !== null
                            ? `${row.change > 0 ? "+" : ""}${row.change.toFixed(2)}`
                            : "—"}
                        </td>
                        <td
                          className={`px-5 py-4 text-right font-bold whitespace-nowrap ${
                            row.percentChange === null
                              ? "text-[#A8AFBD]"
                              : row.percentChange < 0
                                ? "text-green-600"
                                : row.percentChange > 0
                                  ? "text-[#D08A8A]"
                                  : "text-[#E7EAF0]"
                          }`}
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

      {/* Waist section divider */}
      <div className="border-t border-white/10 pt-20">
        <h2 className="text-lg font-bold text-[#F59E0B] mb-5">
          📏 ข้อมูลรอบเอว
        </h2>
        <DashboardWaistSection
          allGroupsWaist={allGroupsWaist}
          userRole={userRole}
        />
      </div>
    </div>
  );
}
