"use client"

import { useActionState, useState } from "react"
import AppModal from "@/components/shared/AppModal"
import { addWaistEntry } from "@/lib/actions/waist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState = { error: "", success: false }

export default function WaistForm() {
  const [state, formAction, isPending] = useActionState(addWaistEntry, initialState)
  const [open, setOpen] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)
  const [waistDisplay, setWaistDisplay] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const w = fd.get("waist") as string
    if (!w) return
    setPendingData(fd)
    setWaistDisplay(w)
    setOpen(true)
  }

  function handleConfirm() {
    setOpen(false)
    if (pendingData) {
      formAction(pendingData)
      setPendingData(null)
    }
  }

  return (
    <>
      <div className="w-full bg-white border border-[#D4C4A8] rounded-2xl shadow-sm px-5 py-4">
        <form onSubmit={handleSubmit}>
          <Label htmlFor="waist" className="text-[#5C3D1E] text-sm font-semibold">
            บันทึกรอบเอววันนี้ (ซม.)
          </Label>
          <div className="flex gap-2 items-center mt-2">
            <Input
              id="waist"
              name="waist"
              type="number"
              step="0.1"
              placeholder="เช่น 80.5"
              required
              className="flex-1 border-[#D4C4A8] focus:border-[#5C3D1E] rounded-xl text-xl px-5 text-center h-12"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="px-6 bg-[#5C3D1E] hover:bg-[#2C1810] text-white rounded-xl font-medium text-base h-12"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
          {state.error && (
            <p className="text-red-500 text-sm mt-2">{state.error}</p>
          )}
        </form>
      </div>

      <AppModal open={open} onClose={() => setOpen(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-[calc(100%-2rem)] max-w-sm p-5 outline-none">
          <h3 className="font-bold text-[#2C1810] text-base mb-2">ยืนยันการบันทึกรอบเอว</h3>
          <p className="text-sm text-[#A08060] mb-5">
            คุณต้องการบันทึกรอบเอว{" "}
            <span className="font-semibold text-[#5C3D1E]">{waistDisplay} ซม.</span>{" "}
            ใช่หรือไม่?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-[#D4C4A8] text-[#5C3D1E] text-sm font-medium hover:bg-[#EDE3D0] transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-[#5C3D1E] text-white text-sm font-medium hover:bg-[#2C1810] transition-colors"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </AppModal>
    </>
  )
}
