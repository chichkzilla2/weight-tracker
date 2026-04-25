"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppModal from "@/components/shared/AppModal";
import {
  THAI_MONTHS,
  THAI_MONTHS_SHORT,
  toThaiYear,
  formatThaiDate,
  formatThaiDateTime,
} from "@/lib/calculations";
import { deleteWeightEntry } from "@/lib/actions/weight";
import { deleteWaistEntry } from "@/lib/actions/waist";
import { Trash2 } from "lucide-react";
import { HistoryTabSkeleton } from "@/components/shared/TableSkeleton";

interface WeightEntryData {
  id: string;
  weight: number;
  recordedAt: string;
}

interface WaistEntryData {
  id: string;
  waist: number;
  recordedAt: string;
}

interface HistoryClientProps {
  entries: WeightEntryData[];
  allEntries: WeightEntryData[];
  waistEntries: WaistEntryData[];
  allWaistEntries: WaistEntryData[];
}

interface MonthRow {
  monthKey: string;
  weight: number | null;
  weightChange: number | null;
  waist: number | null;
  waistChange: number | null;
}

type EntryTab = "weight" | "waist";

export default function HistoryClient({
  entries,
  allEntries,
  waistEntries,
  allWaistEntries,
}: HistoryClientProps) {
  const currentCEYear = new Date().getFullYear();
  const [ceYear, setCeYear] = useState(currentCEYear);
  const [entryTab, setEntryTab] = useState<EntryTab>("weight");
  const [activeEntryTab, setActiveEntryTab] = useState<EntryTab>("weight");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    value: number;
    unit: string;
    date: string;
    type: EntryTab;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [tabPending, startTabTransition] = useTransition();

  // --- Monthly summary ---
  const yearWeightEntries = useMemo(
    () =>
      entries.filter((e) => new Date(e.recordedAt).getFullYear() === ceYear),
    [entries, ceYear],
  );
  const yearWaistEntries = useMemo(
    () =>
      waistEntries.filter(
        (e) => new Date(e.recordedAt).getFullYear() === ceYear,
      ),
    [waistEntries, ceYear],
  );

  const rows: MonthRow[] = useMemo(() => {
    const weightMonthlyMap = new Map<string, number>();
    for (const e of yearWeightEntries) {
      const key = String(new Date(e.recordedAt).getMonth() + 1).padStart(
        2,
        "0",
      );
      weightMonthlyMap.set(key, e.weight);
    }

    const waistMonthlyMap = new Map<string, number>();
    for (const e of yearWaistEntries) {
      const key = String(new Date(e.recordedAt).getMonth() + 1).padStart(
        2,
        "0",
      );
      waistMonthlyMap.set(key, e.waist);
    }

    const monthlyRows: MonthRow[] = THAI_MONTHS_SHORT.map((_, idx) => {
      const monthKey = String(idx + 1).padStart(2, "0");
      return {
        monthKey,
        weight: weightMonthlyMap.get(monthKey) ?? null,
        weightChange: null,
        waist: waistMonthlyMap.get(monthKey) ?? null,
        waistChange: null,
      };
    });

    for (let i = 1; i < monthlyRows.length; i++) {
      const curr = monthlyRows[i]!;
      const prev = monthlyRows[i - 1]!;
      if (curr.weight !== null && prev.weight !== null)
        curr.weightChange = parseFloat((curr.weight - prev.weight).toFixed(1));
      if (curr.waist !== null && prev.waist !== null)
        curr.waistChange = parseFloat((curr.waist - prev.waist).toFixed(1));
    }

    return monthlyRows;
  }, [yearWeightEntries, yearWaistEntries]);

  // --- Weight summary ---
  const allWeightSorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      ),
    [entries],
  );
  const firstWeight = allWeightSorted[0];
  const lastWeight = allWeightSorted[allWeightSorted.length - 1];
  const totalWeightLost =
    firstWeight && lastWeight
      ? parseFloat((firstWeight.weight - lastWeight.weight).toFixed(1))
      : 0;

  // --- Waist summary ---
  const allWaistSorted = useMemo(
    () =>
      [...waistEntries].sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
      ),
    [waistEntries],
  );
  const firstWaist = allWaistSorted[0];
  const lastWaist = allWaistSorted[allWaistSorted.length - 1];
  const totalWaistLost =
    firstWaist && lastWaist
      ? parseFloat((firstWaist.waist - lastWaist.waist).toFixed(1))
      : 0;

  // --- All-entries with change ---
  const weightEntriesWithChange = useMemo(
    () =>
      allEntries.map((e, idx) => {
        const older = allEntries[idx + 1];
        return {
          ...e,
          change:
            older !== undefined
              ? parseFloat((e.weight - older.weight).toFixed(1))
              : null,
        };
      }),
    [allEntries],
  );

  const waistEntriesWithChange = useMemo(
    () =>
      allWaistEntries.map((e, idx) => {
        const older = allWaistEntries[idx + 1];
        return {
          ...e,
          change:
            older !== undefined
              ? parseFloat((e.waist - older.waist).toFixed(1))
              : null,
        };
      }),
    [allWaistEntries],
  );

  // --- Delete handlers ---
  function handleDeleteWeight(e: WeightEntryData) {
    setDeleteTarget({
      id: e.id,
      value: e.weight,
      unit: "กก.",
      date: formatThaiDateTime(new Date(e.recordedAt)),
      type: "weight",
    });
  }

  function handleDeleteWaist(e: WaistEntryData) {
    setDeleteTarget({
      id: e.id,
      value: e.waist,
      unit: "ซม.",
      date: formatThaiDateTime(new Date(e.recordedAt)),
      type: "waist",
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      if (type === "weight") await deleteWeightEntry(id);
      else await deleteWaistEntry(id);
    });
  }

  function changeCell(val: number | null, unit: string) {
    if (val === null) return <span className="text-[#343A46]">—</span>;
    return (
      <span
        className={
          val < 0
            ? "text-green-600 font-medium"
            : val > 0
              ? "text-[#D08A8A] font-medium"
              : "text-[#A8AFBD]"
        }
      >
        {val > 0 ? "+" : ""}
        {val.toFixed(1)}
        {unit && ` ${unit}`}
      </span>
    );
  }

  return (
    <div>
      {/* Year Navigator */}
      <div className="flex items-center justify-center gap-6 my-4">
        <button
          onClick={() => setCeYear((y) => y - 1)}
          className="text-[#F59E0B] hover:text-[#E7EAF0] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-lg font-bold text-[#F59E0B]">
          {toThaiYear(ceYear)}
        </span>
        <button
          onClick={() => setCeYear((y) => y + 1)}
          disabled={ceYear >= currentCEYear}
          className="text-[#F59E0B] hover:text-[#E7EAF0] transition-colors disabled:text-[#343A46] disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Monthly summary table */}
      <div className="mb-2 text-xs text-[#A8AFBD]">
        ตารางนี้ใช้ค่าที่บันทึกล่าสุดของแต่ละเดือน
        และคำนวณการเปลี่ยนแปลงเทียบกับเดือนก่อนหน้า
      </div>

      <div className="glass-card rounded-2xl overflow-hidden mb-5">
        <div className="overflow-x-auto overflow-y-auto max-h-80">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#000000] border-b border-white/10 sticky top-0 z-10">
                <th className="text-left px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                  เดือน
                </th>
                <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                  น้ำหนัก
                </th>
                <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                  น้ำหนักที่เปลี่ยนแปลง
                </th>
                <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                  รอบเอว
                </th>
                <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                  รอบเอวที่เปลี่ยนแปลง
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.monthKey}
                  className={`border-b border-white/10 last:border-0 ${i % 2 === 0 ? "bg-[#171A20]/70" : "bg-[#0F1115]/55"}`}
                >
                  <td className="px-4 py-3 text-[#E7EAF0] whitespace-nowrap">
                    {THAI_MONTHS[i]}
                  </td>
                  <td className="px-4 py-3 text-right text-[#E7EAF0] whitespace-nowrap">
                    {row.weight !== null ? `${row.weight.toFixed(1)} กก.` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {changeCell(row.weightChange, "")}
                  </td>
                  <td className="px-4 py-3 text-right text-[#E7EAF0] whitespace-nowrap">
                    {row.waist !== null ? `${row.waist.toFixed(1)} ซม.` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {changeCell(row.waistChange, "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Summary */}
      {firstWeight && lastWeight && (
        <div className="glass-card rounded-2xl p-5 space-y-3 mb-5">
          <h3 className="font-bold text-[#F59E0B] text-base mb-3">
            สรุปผล — น้ำหนัก
          </h3>
          <p className="text-xs text-[#A8AFBD]">
            น้ำหนักที่ลดลง = น้ำหนักเริ่มต้น - น้ำหนักล่าสุด
            และเปอร์เซ็นต์คิดจากน้ำหนักเริ่มต้น
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-[#A8AFBD]">น้ำหนักเริ่มต้น</span>
            <span className="font-semibold text-[#E7EAF0]">
              {firstWeight.weight.toFixed(1)} กก.{" "}
              <span className="text-[#A8AFBD] font-normal">
                ({toThaiYear(new Date(firstWeight.recordedAt).getFullYear())})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A8AFBD]">น้ำหนักล่าสุด</span>
            <span className="font-semibold text-[#E7EAF0]">
              {lastWeight.weight.toFixed(1)} กก.{" "}
              <span className="text-[#A8AFBD] font-normal">
                ({formatThaiDate(new Date(lastWeight.recordedAt))})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span
              className={`font-semibold ${totalWeightLost > 0 ? "text-green-600" : totalWeightLost < 0 ? "text-[#D08A8A]" : "text-[#A8AFBD]"}`}
            >
              {totalWeightLost > 0
                ? "น้ำหนักลดลง"
                : totalWeightLost < 0
                  ? "น้ำหนักเพิ่มขึ้น"
                  : "น้ำหนักคงที่"}
            </span>
            <span
              className={`font-bold text-base ${totalWeightLost > 0 ? "text-green-600" : totalWeightLost < 0 ? "text-[#D08A8A]" : "text-[#A8AFBD]"}`}
            >
              {totalWeightLost > 0 ? "-" : totalWeightLost < 0 ? "+" : ""}
              {Math.abs(totalWeightLost).toFixed(1)} กก.
            </span>
          </div>
          {totalWeightLost !== 0 && firstWeight && (
            <div className="flex justify-between text-sm">
              <span
                className={`font-semibold ${totalWeightLost > 0 ? "text-green-600" : "text-[#D08A8A]"}`}
              >
                {totalWeightLost > 0 ? "น้ำหนักลดลง %" : "น้ำหนักเพิ่มขึ้น %"}
              </span>
              <span
                className={`font-bold text-base ${totalWeightLost > 0 ? "text-green-600" : "text-[#D08A8A]"}`}
              >
                {totalWeightLost > 0 ? "-" : "+"}
                {Math.abs((totalWeightLost / firstWeight.weight) * 100).toFixed(
                  2,
                )}
                %
              </span>
            </div>
          )}
        </div>
      )}

      {firstWaist && lastWaist && (
        <div className="glass-card rounded-2xl p-5 space-y-3 mb-5">
          <h3 className="font-bold text-[#F59E0B] text-base mb-3">
            สรุปผล — รอบเอว
          </h3>
          <p className="text-xs text-[#A8AFBD]">
            รอบเอวที่ลดลง = รอบเอวเริ่มต้น - รอบเอวล่าสุด
            และเปอร์เซ็นต์คิดจากรอบเอวเริ่มต้น
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-[#A8AFBD]">รอบเอวเริ่มต้น</span>
            <span className="font-semibold text-[#E7EAF0]">
              {firstWaist.waist.toFixed(1)} ซม.{" "}
              <span className="text-[#A8AFBD] font-normal">
                ({toThaiYear(new Date(firstWaist.recordedAt).getFullYear())})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A8AFBD]">รอบเอวล่าสุด</span>
            <span className="font-semibold text-[#E7EAF0]">
              {lastWaist.waist.toFixed(1)} ซม.{" "}
              <span className="text-[#A8AFBD] font-normal">
                ({formatThaiDate(new Date(lastWaist.recordedAt))})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span
              className={`font-semibold ${totalWaistLost > 0 ? "text-green-600" : totalWaistLost < 0 ? "text-[#D08A8A]" : "text-[#A8AFBD]"}`}
            >
              {totalWaistLost > 0
                ? "รอบเอวลดลง"
                : totalWaistLost < 0
                  ? "รอบเอวเพิ่มขึ้น"
                  : "รอบเอวคงที่"}
            </span>
            <span
              className={`font-bold text-base ${totalWaistLost > 0 ? "text-green-600" : totalWaistLost < 0 ? "text-[#D08A8A]" : "text-[#A8AFBD]"}`}
            >
              {totalWaistLost > 0 ? "-" : totalWaistLost < 0 ? "+" : ""}
              {Math.abs(totalWaistLost).toFixed(1)} ซม.
            </span>
          </div>
          {totalWaistLost !== 0 && firstWaist && (
            <div className="flex justify-between text-sm">
              <span
                className={`font-semibold ${totalWaistLost > 0 ? "text-green-600" : "text-[#D08A8A]"}`}
              >
                {totalWaistLost > 0 ? "รอบเอวลดลง %" : "รอบเอวเพิ่มขึ้น %"}
              </span>
              <span
                className={`font-bold text-base ${totalWaistLost > 0 ? "text-green-600" : "text-[#D08A8A]"}`}
              >
                {totalWaistLost > 0 ? "-" : "+"}
                {Math.abs((totalWaistLost / firstWaist.waist) * 100).toFixed(2)}
                %
              </span>
            </div>
          )}
        </div>
      )}

      {/* All entries with tabs */}
      <h2 className="text-base font-bold text-[#F59E0B] mb-3">รายการทั้งหมด</h2>
      <p className="text-xs text-[#A8AFBD] mb-3">
        ค่าที่เปลี่ยนแปลงในแต่ละรายการ คำนวณจากรายการนั้นเทียบกับรายการก่อนหน้า
      </p>

      {/* Tab switcher */}
      <div className="relative flex bg-[#242832]/65 rounded-xl p-1 mb-3">
        <div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-[#F59E0B] shadow-sm pointer-events-none transition-transform duration-200"
          style={{
            width: "calc((100% - 8px) / 2)",
            transform: `translateX(${activeEntryTab === "waist" ? "100%" : "0%"})`,
          }}
        />
        {(["weight", "waist"] as EntryTab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveEntryTab(t);
              startTabTransition(() => setEntryTab(t));
            }}
            className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 ${activeEntryTab === t ? "text-[#111318]" : "text-[#A8AFBD]"}`}
          >
            {t === "weight" ? "น้ำหนัก" : "รอบเอว"}
          </button>
        ))}
      </div>

      {tabPending || activeEntryTab !== entryTab ? (
        <div className="mb-5">
          <HistoryTabSkeleton />
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden mb-5">
          <div className="overflow-x-auto overflow-y-auto max-h-96">
            {entryTab === "weight" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#000000] border-b border-white/10 sticky top-0 z-10">
                    <th className="text-left px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                      วันที่
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                      น้ำหนัก (กก.)
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                      เปลี่ยนแปลง
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {weightEntriesWithChange.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-[#A8AFBD]"
                      >
                        ยังไม่มีข้อมูล
                      </td>
                    </tr>
                  ) : (
                    weightEntriesWithChange.map((e, i) => (
                      <tr
                        key={e.id}
                        className={`border-b border-white/10 last:border-0 ${i % 2 === 0 ? "bg-[#171A20]/70" : "bg-[#0F1115]/55"}`}
                      >
                        <td className="px-4 py-3 text-[#E7EAF0] whitespace-nowrap">
                          {formatThaiDateTime(new Date(e.recordedAt))}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#E7EAF0] whitespace-nowrap">
                          {e.weight.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {changeCell(e.change, "")}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteWeight(e)}
                            disabled={isPending}
                            className="px-3 py-1 rounded-lg bg-[#8A3F3F] hover:bg-[#7A3434] text-white text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            ลบข้อมูล
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#000000] border-b border-white/10 sticky top-0 z-10">
                    <th className="text-left px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                      วันที่
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                      รอบเอว (ซม.)
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-[#F59E0B] whitespace-nowrap">
                      เปลี่ยนแปลง
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {waistEntriesWithChange.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-[#A8AFBD]"
                      >
                        ยังไม่มีข้อมูล
                      </td>
                    </tr>
                  ) : (
                    waistEntriesWithChange.map((e, i) => (
                      <tr
                        key={e.id}
                        className={`border-b border-white/10 last:border-0 ${i % 2 === 0 ? "bg-[#171A20]/70" : "bg-[#0F1115]/55"}`}
                      >
                        <td className="px-4 py-3 text-[#E7EAF0] whitespace-nowrap">
                          {formatThaiDateTime(new Date(e.recordedAt))}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#E7EAF0] whitespace-nowrap">
                          {e.waist.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {changeCell(e.change, "")}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteWaist(e)}
                            disabled={isPending}
                            className="px-3 py-1 rounded-lg bg-[#8A3F3F] hover:bg-[#7A3434] text-white text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            ลบข้อมูล
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      <AppModal
        open={deleteTarget !== null}
        onClose={() => {
          if (!isPending) setDeleteTarget(null);
        }}
      >
        <div className="fixed bottom-0 left-0 right-0 glass-panel glass-glow rounded-t-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto p-5 outline-none border border-white/10 animate-in slide-in-from-bottom-6 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:absolute sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#8A3F3F]/20 text-[#D08A8A]">
            <Trash2 size={23} />
          </div>
          <div className="mb-6 text-center">
            <h3 className="font-bold text-[#E7EAF0] text-lg">
              ยืนยันการลบรายการ
            </h3>
          </div>
          <div className="mb-6 text-center">
            <p className="text-sm text-[#A8AFBD]">
              ลบรายการ{" "}
              <span className="font-semibold text-[#F59E0B]">
                {deleteTarget?.value.toFixed(1)} {deleteTarget?.unit}
              </span>{" "}
              วันที่{" "}
              <span className="font-semibold text-[#F59E0B]">
                {deleteTarget?.date}
              </span>
              ?
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#F59E0B] text-sm font-medium hover:bg-[#242832]/65 transition-colors disabled:opacity-40"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#8A3F3F] text-white text-sm font-medium hover:bg-[#7A3434] transition-colors disabled:opacity-40"
            >
              {isPending ? "กำลังลบ..." : "ลบรายการ"}
            </button>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
