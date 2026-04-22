import { formatThaiDate } from "@/lib/calculations";

interface WaistCardProps {
  waist: number | null;
  recordedAt: Date | null;
}

export default function WaistCard({ waist, recordedAt }: WaistCardProps) {
  return (
    <div className="w-full bg-white border border-[#D4C4A8] rounded-2xl shadow-sm px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#A08060] mb-3">
        รอบเอวล่าสุด
      </p>
      {waist !== null ? (
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-bold text-[#5C3D1E] leading-none">
              {waist.toFixed(1)}
            </p>
            <p className="text-lg text-[#A08060] leading-none mb-0.5">ซม.</p>
          </div>
          {recordedAt && (
            <p className="text-xs text-[#A08060] mt-1.5 whitespace-nowrap">
              บันทึกเมื่อ {formatThaiDate(new Date(recordedAt))}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-5xl font-bold text-[#D4C4A8] leading-none">—</p>
          <p className="text-sm text-[#A08060]">ยังไม่มีข้อมูล</p>
        </div>
      )}
    </div>
  );
}
