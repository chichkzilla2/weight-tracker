import { LeaderboardSkeleton } from "@/components/shared/TableSkeleton"

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-6">
      <div className="mb-6 space-y-3">
        <div className="h-7 w-48 animate-pulse rounded-full bg-[#F59E0B]/25" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="space-y-8">
        <LeaderboardSkeleton />
        <div className="border-t border-white/10" />
        <LeaderboardSkeleton />
      </div>
    </div>
  )
}
