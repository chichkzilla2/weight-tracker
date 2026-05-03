"use client"

import { useActionState, useState } from "react"
import AppModal from "@/components/shared/AppModal"
import { addWaistEntry } from "@/lib/actions/waist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"

const initialState = { error: "", success: false }

interface WaistFormProps {
  disabled?: boolean
  disabledMessage?: string
}

export default function WaistForm({ disabled = false, disabledMessage = "" }: WaistFormProps) {
  const [state, formAction, isPending] = useActionState(addWaistEntry, initialState)
  const [open, setOpen] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)
  const [waistDisplay, setWaistDisplay] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (disabled) return
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
      <div className="w-full glass-card rounded-2xl px-5 py-4">
        <form onSubmit={handleSubmit}>
          <Label htmlFor="waist" className="text-[#F59E0B] text-sm font-semibold">
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
              disabled={disabled}
              className="flex-1 border-white/10 focus:border-[#F59E0B] rounded-xl text-xl px-5 text-center h-12"
            />
            <Button
              type="submit"
              disabled={disabled || isPending}
              className="px-6 bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl font-medium text-base h-12"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
          {state.error && (
            <p className="text-[#D08A8A] text-sm mt-2">{state.error}</p>
          )}
          {disabled && disabledMessage && (
            <p className="text-[#A8AFBD] text-xs mt-2">{disabledMessage}</p>
          )}
        </form>
      </div>

      <AppModal open={open} onClose={() => setOpen(false)}>
        <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-[rgb(23,26,32)] shadow-2xl w-full max-h-[65vh] overflow-y-auto p-5 outline-none border border-white/10 animate-in slide-in-from-bottom-6 duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95 sm:absolute sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:right-auto sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-sm">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F59E0B]/15 text-[#F59E0B]">
            <CheckCircle2 size={24} />
          </div>
          <div className="mb-6 text-center">
            <h3 className="font-bold text-[#E7EAF0] text-lg">ยืนยันการบันทึกรอบเอว</h3>
          </div>
          <div className="mb-6 text-center">
            <p className="text-sm text-[#A8AFBD]">
              คุณต้องการบันทึกรอบเอว{" "}
              <span className="font-semibold text-[#F59E0B]">{waistDisplay} ซม.</span>{" "}
              ใช่หรือไม่?
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#F59E0B] text-sm font-medium hover:bg-[#242832]/65 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-[#F59E0B] text-[#111318] text-sm font-medium hover:bg-[#D97706] transition-colors"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      </AppModal>
    </>
  )
}
