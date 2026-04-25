import { formatThaiDate } from "@/lib/calculations";

interface WeightCardProps {
  weight: number | null;
  recordedAt: Date | null;
}

export default function WeightCard({ weight, recordedAt }: WeightCardProps) {
  return (
    <div className="w-full glass-card rounded-2xl px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#A8AFBD] mb-3">
        น้ำหนักล่าสุด
      </p>
      {weight !== null ? (
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-bold text-[#F59E0B] leading-none">
              {weight.toFixed(1)}
            </p>
            <p className="text-lg text-[#A8AFBD] leading-none mb-0.5">กก.</p>
          </div>
          {recordedAt && (
            <p className="text-xs text-[#A8AFBD] mt-1.5 whitespace-nowrap">
              บันทึกเมื่อ {formatThaiDate(new Date(recordedAt))}
            </p>
          )}
        </div>
      ) : (
        <div className="flex items-baseline gap-2">
          <p className="text-5xl font-bold text-[#343A46] leading-none">—</p>
          <p className="text-sm text-[#A8AFBD]">ยังไม่มีข้อมูล</p>
        </div>
      )}
    </div>
  );
}
