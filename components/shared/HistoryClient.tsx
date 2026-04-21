"use client"

import { useState, useTransition } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Modal from "@mui/material/Modal"
import {
  THAI_MONTHS,
  THAI_MONTHS_SHORT,
  toThaiYear,
  formatThaiDate,
  formatThaiDateTime,
} from "@/lib/calculations"
import { deleteWeightEntry } from "@/lib/actions/weight"

interface EntryData {
  id: string
  weight: number
  recordedAt: string
}

interface HistoryClientProps {
  entries: EntryData[]
  allEntries: EntryData[]
}

interface MonthRow {
  monthKey: string
  monthName: string
  weight: number | null
  change: number | null
}

export default function HistoryClient({ entries, allEntries }: HistoryClientProps) {
  const currentCEYear = new Date().getFullYear()
  const [ceYear, setCeYear] = useState(currentCEYear)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; weight: number; date: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // Build monthly map for this year
  const yearEntries = entries.filter((e) => {
    const d = new Date(e.recordedAt)
    return d.getFullYear() === ceYear
  })

  // Last weight per month
  const monthlyMap = new Map<string, number>()
  for (const entry of yearEntries) {
    const d = new Date(entry.recordedAt)
    const key = String(d.getMonth() + 1).padStart(2, "0")
    monthlyMap.set(key, entry.weight)
  }

  // Build 12 rows
  const rows: MonthRow[] = THAI_MONTHS_SHORT.map((shortName, idx) => {
    const monthKey = String(idx + 1).padStart(2, "0")
    const weight = monthlyMap.get(monthKey) ?? null
    return {
      monthKey,
      monthName: `${shortName} (${idx + 1})`,
      weight,
      change: null,
    }
  })

  // Calculate changes
  for (let i = 1; i < rows.length; i++) {
    const curr = rows[i]
    const prev = rows[i - 1]
    if (curr !== undefined && prev !== undefined && curr.weight !== null && prev.weight !== null) {
      curr.change = parseFloat((curr.weight - prev.weight).toFixed(1))
    }
  }

  // Summary stats (based on all-time asc entries)
  const allSorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )
  const firstEntry = allSorted[0]
  const lastEntry = allSorted[allSorted.length - 1]

  const totalLost =
    firstEntry && lastEntry
      ? parseFloat((firstEntry.weight - lastEntry.weight).toFixed(1))
      : 0

  // Build per-entry change for the all-entries table (allEntries is desc)
  const allEntriesWithChange = allEntries.map((entry, idx) => {
    const older = allEntries[idx + 1]
    const change = older !== undefined ? parseFloat((entry.weight - older.weight).toFixed(1)) : null
    return { ...entry, change }
  })

  function handleDeleteClick(entry: EntryData) {
    setDeleteTarget({
      id: entry.id,
      weight: entry.weight,
      date: formatThaiDateTime(new Date(entry.recordedAt)),
    })
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleteTarget(null)
    startTransition(async () => {
      await deleteWeightEntry(id)
    })
  }

  return (
    <div>
      {/* Year Navigator */}
      <div className="flex items-center justify-center gap-6 my-4">
        <button
          onClick={() => setCeYear((y) => y - 1)}
          className="text-[#5C3D1E] hover:text-[#2C1810] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-lg font-bold text-[#5C3D1E]">{toThaiYear(ceYear)}</span>
        <button
          onClick={() => setCeYear((y) => y + 1)}
          disabled={ceYear >= currentCEYear}
          className="text-[#5C3D1E] hover:text-[#2C1810] transition-colors disabled:text-[#D4C4A8] disabled:cursor-not-allowed"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Monthly summary table */}
      <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="overflow-y-auto max-h-80">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F0E4] border-b border-[#D4C4A8] sticky top-0 z-10">
              <th className="text-left px-4 py-3 font-semibold text-[#5C3D1E]">เดือน</th>
              <th className="text-right px-4 py-3 font-semibold text-[#5C3D1E]">
                น้ำหนักล่าสุด
              </th>
              <th className="text-right px-4 py-3 font-semibold text-[#5C3D1E]">
                เปลี่ยนแปลง
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.monthKey}
                className={`border-b border-[#EDE3D0] last:border-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"
                }`}
              >
                <td className="px-4 py-3 text-[#2C1810]">
                  {THAI_MONTHS[i]}
                </td>
                <td className="px-4 py-3 text-right text-[#2C1810]">
                  {row.weight !== null ? `${row.weight.toFixed(1)} กก.` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.change !== null ? (
                    <span
                      className={
                        row.change < 0
                          ? "text-green-600 font-medium"
                          : row.change > 0
                          ? "text-red-500 font-medium"
                          : "text-[#A08060]"
                      }
                    >
                      {row.change > 0 ? "+" : ""}
                      {row.change.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[#D4C4A8]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Summary */}
      {firstEntry && lastEntry && (
        <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm p-5 space-y-3 mb-5">
          <h3 className="font-bold text-[#5C3D1E] text-base mb-3">สรุปผล</h3>
          <div className="flex justify-between text-sm">
            <span className="text-[#A08060]">น้ำหนักเริ่มต้น</span>
            <span className="font-semibold text-[#2C1810]">
              {firstEntry.weight.toFixed(1)} กก.{" "}
              <span className="text-[#A08060] font-normal">
                ({toThaiYear(new Date(firstEntry.recordedAt).getFullYear())})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#A08060]">น้ำหนักล่าสุด</span>
            <span className="font-semibold text-[#2C1810]">
              {lastEntry.weight.toFixed(1)} กก.{" "}
              <span className="text-[#A08060] font-normal">
                ({formatThaiDate(new Date(lastEntry.recordedAt))})
              </span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={`font-semibold ${totalLost > 0 ? "text-green-600" : totalLost < 0 ? "text-red-500" : "text-[#A08060]"}`}>
              {totalLost > 0 ? "น้ำหนักลดลง" : totalLost < 0 ? "น้ำหนักเพิ่มขึ้น" : "น้ำหนักคงที่"}
            </span>
            <span className={`font-bold text-base ${totalLost > 0 ? "text-green-600" : totalLost < 0 ? "text-red-500" : "text-[#A08060]"}`}>
              {totalLost > 0 ? "-" : totalLost < 0 ? "+" : ""}
              {Math.abs(totalLost).toFixed(1)} กก.
            </span>
          </div>
          {totalLost !== 0 && firstEntry && (
            <div className="flex justify-between text-sm">
              <span className={`font-semibold ${totalLost > 0 ? "text-green-600" : "text-red-500"}`}>
                {totalLost > 0 ? "น้ำหนักลดลง %" : "น้ำหนักเพิ่มขึ้น %"}
              </span>
              <span className={`font-bold text-base ${totalLost > 0 ? "text-green-600" : "text-red-500"}`}>
                {totalLost > 0 ? "-" : "+"}
                {Math.abs((totalLost / firstEntry.weight) * 100).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* All individual weight entries */}
      <h2 className="text-base font-bold text-[#5C3D1E] mb-3">รายการน้ำหนักทั้งหมด</h2>
      <div className="bg-white border border-[#D4C4A8] rounded-2xl shadow-sm overflow-hidden mb-5">
        <div className="overflow-x-auto overflow-y-auto max-h-96">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F7F0E4] border-b border-[#D4C4A8] sticky top-0 z-10">
              <th className="text-left px-4 py-3 font-semibold text-[#5C3D1E] whitespace-nowrap">วันที่</th>
              <th className="text-right px-4 py-3 font-semibold text-[#5C3D1E] whitespace-nowrap">น้ำหนัก (กก.)</th>
              <th className="text-right px-4 py-3 font-semibold text-[#5C3D1E] whitespace-nowrap">เปลี่ยนแปลง</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {allEntriesWithChange.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#A08060]">
                  ยังไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              allEntriesWithChange.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-b border-[#EDE3D0] last:border-0 ${
                    i % 2 === 0 ? "bg-white" : "bg-[#FDFAF5]"
                  }`}
                >
                  <td className="px-4 py-3 text-[#2C1810] whitespace-nowrap">
                    {formatThaiDateTime(new Date(entry.recordedAt))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-[#2C1810] whitespace-nowrap">
                    {entry.weight.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {entry.change !== null ? (
                      <span
                        className={
                          entry.change < 0
                            ? "text-green-600 font-medium"
                            : entry.change > 0
                            ? "text-red-500 font-medium"
                            : "text-[#A08060]"
                        }
                      >
                        {entry.change > 0 ? "+" : ""}
                        {entry.change.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-[#D4C4A8]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteClick(entry)}
                      disabled={isPending}
                      className="px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors disabled:opacity-40"
                    >
                      ลบข้อมูล
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Delete confirm modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => { if (!isPending) setDeleteTarget(null) }}
        slotProps={{ backdrop: { style: { backgroundColor: "rgba(0,0,0,0.45)" } } }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-sm p-5 outline-none">
          <h3 className="font-bold text-[#2C1810] text-base mb-2">ยืนยันการลบรายการ</h3>
          <p className="text-sm text-[#A08060] mb-5">
            ลบรายการน้ำหนัก{" "}
            <span className="font-semibold text-[#5C3D1E]">{deleteTarget?.weight.toFixed(1)} กก.</span>{" "}
            วันที่ <span className="font-semibold text-[#5C3D1E]">{deleteTarget?.date}</span>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl border border-[#D4C4A8] text-[#5C3D1E] text-sm font-medium hover:bg-[#EDE3D0] transition-colors disabled:opacity-40"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-40"
            >
              {isPending ? "กำลังลบ..." : "ลบรายการ"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
