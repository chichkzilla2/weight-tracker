import { AdminUsersSkeleton } from "@/components/shared/TableSkeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-5 h-7 w-52 animate-pulse rounded-full bg-[#F59E0B]/25" />
      <div className="mb-5 flex rounded-xl bg-[#242832]/65 p-1">
        <div className="h-8 flex-1 rounded-lg bg-[#F59E0B]/25" />
        <div className="h-8 flex-1 rounded-lg bg-white/5" />
      </div>
      <AdminUsersSkeleton />
    </div>
  )
}
