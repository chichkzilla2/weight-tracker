"use client";

import { useMemo, useState, useTransition } from "react";
import type { LeaderboardEntry } from "@/lib/calculations";
import { LeaderboardSkeleton } from "@/components/shared/TableSkeleton";
import { GlassSelect } from "@/components/shared/GlassSelect";

interface MonthlyLeaderboard {
  monthKey: string;
  label: string;
  leaderboard: LeaderboardEntry[];
}

interface LeaderboardClientProps {
  monthlyLeaderboards: MonthlyLeaderboard[];
  currentMonthKey: string;
  prevMonthKey: string;
  currentGroupId: string | null;
  lastUpdated: string;
  waistMonthlyLeaderboards: MonthlyLeaderboard[];
  waistCurrentMonthKey: string;
  waistPrevMonthKey: string;
}

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

type TimeTab = "current" | "prev" | "history";

function LeaderboardTable({
  leaderboard,
  currentGroupId,
  filterMine,
  colTotal,
  colStart,
  colLost,
  colPercent,
}: {
  leaderboard: LeaderboardEntry[];
  currentGroupId: string | null;
  filterMine: boolean;
  colTotal: string;
  colStart: string;
  colLost: string;
  colPercent: string;
}) {
  const displayed = useMemo(
    () =>
      filterMine
        ? leaderboard.filter((e) => e.groupId === currentGroupId)
        : leaderboard,
    [leaderboard, currentGroupId, filterMine],
  );

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-96">
        <table className="responsive-table w-full text-base">
          <thead>
            <tr className="bg-[#000000] border-b border-white/10 sticky top-0 z-10">
              <th className="text-left px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                #
              </th>
              <th className="text-left px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                ชื่อกลุ่ม
              </th>
              <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                {colStart}
              </th>
              <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                {colTotal}
              </th>
              <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                {colLost}
              </th>
              <th className="text-right px-5 py-4 font-semibold text-[#F59E0B] whitespace-nowrap">
                {colPercent}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((entry, idx) => {
              const globalRank = leaderboard.findIndex(
                (e) => e.groupId === entry.groupId,
              );
              const isMyGroup = entry.groupId === currentGroupId;
              const medal = RANK_MEDALS[globalRank];
              return (
                <tr
                  key={entry.groupId}
                  className={`border-b border-white/10 last:border-0 ${
                    isMyGroup
                      ? "bg-[#242832]/65"
                      : idx % 2 === 0
                        ? "bg-[#171A20]/70"
                        : "bg-[#0F1115]/55"
                  }`}
                >
                  <td data-label="ลำดับที่" className="rank-card-row px-5 py-4 text-[#F59E0B] font-bold whitespace-nowrap">
                    {medal ? (
                      <span className="text-2xl leading-none">{medal}</span>
                    ) : (
                      `${globalRank + 1}`
                    )}
                  </td>
                  <td data-label="ชื่อกลุ่ม" className="px-5 py-4 text-[#E7EAF0] font-medium whitespace-nowrap">
                    {entry.groupName}
                    {isMyGroup && (
                      <span className="text-xs text-[#A8AFBD] ml-1">
                        (ของฉัน)
                      </span>
                    )}
                  </td>
                  <td data-label={colStart} className="px-5 py-4 text-right text-[#E7EAF0] whitespace-nowrap">
                    {entry.startTotal.toFixed(1)}
                  </td>
                  <td data-label={colTotal} className="px-5 py-4 text-right text-[#E7EAF0] whitespace-nowrap">
                    {entry.latestTotal.toFixed(1)}
                  </td>
                  <td data-label={colLost} className="px-5 py-4 text-right text-green-600 font-medium whitespace-nowrap">
                    {entry.lostKg > 0 ? "-" : ""}
                    {Math.abs(entry.lostKg).toFixed(1)}
                  </td>
                  <td data-label={colPercent} className="px-5 py-4 text-right text-green-600 font-bold whitespace-nowrap">
                    {entry.lostPercent > 0 ? "-" : ""}
                    {Math.abs(entry.lostPercent).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
            {displayed.length === 0 && (
              <tr>
                <td
                  data-label=""
                  colSpan={6}
                  className="px-4 py-8 text-center text-[#A8AFBD]"
                >
                  ไม่มีข้อมูลเดือนนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderboardSection({
  monthlyLeaderboards,
  currentMonthKey,
  prevMonthKey,
  currentGroupId,
  colTotal,
  colStart,
  colLost,
  colPercent,
}: {
  monthlyLeaderboards: MonthlyLeaderboard[];
  currentMonthKey: string;
  prevMonthKey: string;
  currentGroupId: string | null;
  colTotal: string;
  colStart: string;
  colLost: string;
  colPercent: string;
}) {
  const [groupTab, setGroupTab] = useState<"all" | "mine">("all");
  const [activeGroupTab, setActiveGroupTab] = useState<"all" | "mine">("all");
  const [monthTab, setMonthTab] = useState<TimeTab>("current");
  const [activeMonthTab, setActiveMonthTab] = useState<TimeTab>("current");
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>(
    monthlyLeaderboards[monthlyLeaderboards.length - 1]?.monthKey ?? "",
  );
  const [tabPending, startTabTransition] = useTransition();

  const filterMine = groupTab === "mine";
  const monthTabIndex =
    activeMonthTab === "current" ? 0 : activeMonthTab === "prev" ? 1 : 2;
  const groupTabIndex = activeGroupTab === "all" ? 0 : 1;

  const currentData = useMemo(
    () => monthlyLeaderboards.find((m) => m.monthKey === currentMonthKey),
    [monthlyLeaderboards, currentMonthKey],
  );
  const prevData = useMemo(
    () => monthlyLeaderboards.find((m) => m.monthKey === prevMonthKey),
    [monthlyLeaderboards, prevMonthKey],
  );
  const historyData = useMemo(
    () => monthlyLeaderboards.find((m) => m.monthKey === selectedHistoryMonth),
    [monthlyLeaderboards, selectedHistoryMonth],
  );
  const activeData =
    monthTab === "current"
      ? currentData
      : monthTab === "prev"
        ? prevData
        : historyData;

  return (
    <div>
      <div className="relative flex bg-[#242832]/65 rounded-xl p-1 mb-3">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-[#F59E0B] shadow-sm pointer-events-none"
          style={{
            width: "calc((100% - 8px) / 3)",
            transform: `translateX(${monthTabIndex * 100}%)`,
            transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {(["current", "prev", "history"] as const).map((tab, i) => (
          <button
            key={tab}
            onClick={() => {
              setActiveMonthTab(tab);
              startTabTransition(() => setMonthTab(tab));
            }}
            className={`relative z-10 flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-200 ${activeMonthTab === tab ? "text-[#111318]" : "text-[#A8AFBD]"}`}
          >
            {i === 0 ? "เดือนนี้" : i === 1 ? "เดือนที่แล้ว" : "ประวัติ"}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#F59E0B]">
          {monthTab === "current" &&
            (currentData?.label ?? "ยังไม่มีข้อมูลเดือนนี้")}
          {monthTab === "prev" &&
            (prevData?.label ?? "ยังไม่มีข้อมูลเดือนที่แล้ว")}
          {monthTab === "history" && historyData?.label}
        </p>
        {monthTab === "history" && monthlyLeaderboards.length > 0 && (
          <GlassSelect
            size="sm"
            value={selectedHistoryMonth}
            onChange={setSelectedHistoryMonth}
            options={[...monthlyLeaderboards].reverse().map((m) => ({
              value: m.monthKey,
              label: m.label,
            }))}
          />
        )}
      </div>

      <div className="relative flex bg-[#242832]/65 rounded-xl p-1 mb-4">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-[#171A20]/70 shadow-sm pointer-events-none"
          style={{
            width: "calc((100% - 8px) / 2)",
            transform: `translateX(${groupTabIndex * 100}%)`,
            transition: "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {(["all", "mine"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveGroupTab(tab);
              startTabTransition(() => setGroupTab(tab));
            }}
            className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 ${activeGroupTab === tab ? "text-[#F59E0B]" : "text-[#A8AFBD]"}`}
          >
            {tab === "all" ? "ทุกกลุ่ม" : "กลุ่มของฉัน"}
          </button>
        ))}
      </div>

      {tabPending ||
      activeMonthTab !== monthTab ||
      activeGroupTab !== groupTab ? (
        <LeaderboardSkeleton />
      ) : activeData ? (
        <>
          <p className="text-xs text-[#A8AFBD] mb-2">
            คำนวณจากผลรวมค่าเริ่มต้นของสมาชิก เทียบกับค่าล่าสุดของเดือนนั้น
            แล้วเรียงตามเปอร์เซ็นต์ที่ลดลง
          </p>
          <LeaderboardTable
            leaderboard={activeData.leaderboard}
            currentGroupId={currentGroupId}
            filterMine={filterMine}
            colTotal={colTotal}
            colStart={colStart}
            colLost={colLost}
            colPercent={colPercent}
          />
        </>
      ) : (
        <div className="glass-card rounded-2xl px-4 py-10 text-center text-[#A8AFBD]">
          ไม่มีข้อมูลในช่วงเวลานี้
        </div>
      )}
    </div>
  );
}

export default function LeaderboardClient({
  monthlyLeaderboards,
  currentMonthKey,
  prevMonthKey,
  currentGroupId,
  lastUpdated,
  waistMonthlyLeaderboards,
  waistCurrentMonthKey,
  waistPrevMonthKey,
}: LeaderboardClientProps) {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8">
      {/* Weight section */}
      <div>
        <h2 className="text-base font-bold text-[#F59E0B] mb-3">
          🏋️ อันดับน้ำหนัก
        </h2>
        <LeaderboardSection
          monthlyLeaderboards={monthlyLeaderboards}
          currentMonthKey={currentMonthKey}
          prevMonthKey={prevMonthKey}
          currentGroupId={currentGroupId}
          colStart="น้ำหนักเริ่มต้น"
          colTotal="น้ำหนักรวม"
          colLost="ลดลง (กก.)"
          colPercent="% ลด"
        />
      </div>

      <div className="border-t border-white/10" />

      {/* Waist section */}
      <div>
        <h2 className="text-base font-bold text-[#F59E0B] mb-3">
          📏 อันดับรอบเอว
        </h2>
        {waistMonthlyLeaderboards.length > 0 ? (
          <LeaderboardSection
            monthlyLeaderboards={waistMonthlyLeaderboards}
            currentMonthKey={waistCurrentMonthKey}
            prevMonthKey={waistPrevMonthKey}
            currentGroupId={currentGroupId}
            colStart="รอบเอวเริ่มต้น"
            colTotal="รอบเอวรวม"
            colLost="ลดลง (ซม.)"
            colPercent="% ลด"
          />
        ) : (
          <div className="glass-card rounded-2xl px-4 py-8 text-center text-[#A8AFBD]">
            ยังไม่มีข้อมูลรอบเอว
          </div>
        )}
      </div>

      <p className="text-xs text-[#A8AFBD] text-center">
        บันทึกล่าสุด: {lastUpdated}
      </p>
    </div>
  );
}
