"use client"

import { useActionState } from "react"
import { addWeightEntry } from "@/lib/actions/weight"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState = { error: "", success: false }

export default function WeightForm() {
  const [state, formAction, isPending] = useActionState(addWeightEntry, initialState)

  return (
    <div className="w-full bg-white border border-[#D4C4A8] rounded-2xl shadow-sm px-5 py-4">
      <form action={formAction}>
        <Label htmlFor="weight" className="text-[#5C3D1E] text-sm font-semibold">
          บันทึกน้ำหนักวันนี้ (กก.)
        </Label>
        <div className="flex gap-2 items-center mt-2">
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
placeholder="เช่น 72.5"
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
  )
}
