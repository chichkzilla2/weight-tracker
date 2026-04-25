import type { ReactNode } from "react";

function PulseLine({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-white/10 ${className}`} />;
}

function SkeletonCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass-card rounded-2xl animate-pulse ${className}`}>
      {children}
    </div>
  );
}

function TableGridSkeleton({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div
        className="grid gap-px bg-white/10"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`h-${i}`} className="h-12 bg-[#171A20] px-4 py-3">
            <PulseLine className="h-3 w-20 bg-[#F59E0B]/25" />
          </div>
        ))}
        {Array.from({ length: rows * columns }).map((_, i) => (
          <div key={i} className="h-12 bg-[#0F1115]/55 px-4 py-3">
            <PulseLine className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminUsersSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <PulseLine className="h-4 w-28" />
        <PulseLine className="h-8 w-28 bg-[#F59E0B]/25" />
      </div>
      <SkeletonCard className="space-y-2 p-3">
        <PulseLine className="h-9 w-full" />
        <PulseLine className="h-8 w-full" />
      </SkeletonCard>
      <SkeletonCard className="overflow-hidden p-0">
        <TableGridSkeleton rows={6} columns={4} />
        <div className="flex items-center justify-between border-t border-white/10 p-3">
          <PulseLine className="h-3 w-36" />
          <PulseLine className="h-8 w-20 bg-[#F59E0B]/25" />
        </div>
      </SkeletonCard>
    </div>
  );
}

export function AdminGroupsSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonCard className="p-3">
        <PulseLine className="h-9 w-full" />
      </SkeletonCard>
      <div className="flex items-center justify-between">
        <PulseLine className="h-4 w-28" />
        <PulseLine className="h-8 w-28 bg-[#F59E0B]/25" />
      </div>
      <SkeletonCard className="overflow-hidden p-0">
        <TableGridSkeleton rows={6} columns={3} />
      </SkeletonCard>
    </div>
  );
}

export function HistoryTabSkeleton() {
  return (
    <SkeletonCard className="mb-5 overflow-hidden p-0">
      <TableGridSkeleton rows={6} columns={4} />
    </SkeletonCard>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      <PulseLine className="h-4 w-40 bg-[#F59E0B]/25" />
      <SkeletonCard className="overflow-hidden p-0">
        <TableGridSkeleton rows={6} columns={6} />
      </SkeletonCard>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-4 pb-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="p-4">
            <PulseLine className="h-3 w-24 bg-[#F59E0B]/25" />
            <PulseLine className="mt-4 h-7 w-20" />
            <PulseLine className="mt-3 h-3 w-32" />
          </SkeletonCard>
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <SkeletonCard key={i} className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <PulseLine className="h-4 w-36 bg-[#F59E0B]/25" />
            <PulseLine className="h-9 w-32" />
          </div>
          <div className="space-y-3">
            {[80, 65, 52, 44, 30].map((width, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <PulseLine className="h-3 w-16" />
                <div className="h-5 flex-1 rounded-full bg-white/5">
                  <div
                    className="h-5 rounded-full bg-[#F59E0B]/25"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <PulseLine className="h-3 w-12" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-6">
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={`card-${i}`} className="p-5">
            <PulseLine className="h-4 w-24 bg-[#F59E0B]/25" />
            <PulseLine className="mt-5 h-8 w-28" />
            <PulseLine className="mt-3 h-3 w-36" />
          </SkeletonCard>
        ))}
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCard key={`form-${i}`} className="space-y-3 p-4">
            <PulseLine className="h-3 w-24 bg-[#F59E0B]/25" />
            <PulseLine className="h-10 w-full" />
            <PulseLine className="h-10 w-full bg-[#F59E0B]/25" />
          </SkeletonCard>
        ))}
      </div>
      <PulseLine className="h-4 w-24 bg-[#F59E0B]/25" />
      <TableGridSkeleton rows={5} columns={5} />
    </div>
  );
}

export function GroupSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 pb-6">
      <SkeletonCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <PulseLine className="h-4 w-28 bg-[#F59E0B]/25" />
            <PulseLine className="mt-3 h-3 w-32" />
          </div>
          <PulseLine className="h-9 w-14" />
        </div>
        <PulseLine className="mt-4 h-2 w-full" />
      </SkeletonCard>
      <SkeletonCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 p-4">
          <PulseLine className="h-4 w-36 bg-[#F59E0B]/25" />
          <PulseLine className="mt-2 h-3 w-56" />
        </div>
        <TableGridSkeleton rows={6} columns={5} />
      </SkeletonCard>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-lg px-4 pb-6">
      <div className="mb-8 flex flex-col items-center">
        <div className="h-20 w-20 animate-pulse rounded-full bg-[#F59E0B]/25" />
        <PulseLine className="mt-4 h-5 w-40" />
        <PulseLine className="mt-3 h-6 w-24 bg-[#F59E0B]/20" />
      </div>
      <SkeletonCard className="mb-4 space-y-4 p-4">
        <div className="flex justify-between">
          <PulseLine className="h-3 w-24" />
          <PulseLine className="h-3 w-28" />
        </div>
        <div className="flex justify-between">
          <PulseLine className="h-3 w-28" />
          <PulseLine className="h-3 w-36" />
        </div>
      </SkeletonCard>
      <SkeletonCard className="overflow-hidden p-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-white/10 p-5 last:border-b-0"
          >
            <PulseLine className="h-4 w-40" />
            <PulseLine className="h-4 w-4" />
          </div>
        ))}
      </SkeletonCard>
    </div>
  );
}

export function HowToSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} className="p-4">
          <PulseLine className="h-4 w-44 bg-[#F59E0B]/25" />
          <div className="mt-4 space-y-2">
            <PulseLine className="h-3 w-full" />
            <PulseLine className="h-3 w-5/6" />
            <PulseLine className="h-3 w-3/4" />
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <SkeletonCard className="w-full max-w-sm space-y-4 p-5">
        <div className="mx-auto h-14 w-14 rounded-full bg-[#F59E0B]/25" />
        <PulseLine className="mx-auto h-5 w-32 bg-[#F59E0B]/25" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <PulseLine className="h-3 w-20" />
            <PulseLine className="h-10 w-full" />
          </div>
        ))}
        <PulseLine className="h-10 w-full bg-[#F59E0B]/25" />
      </SkeletonCard>
    </div>
  );
}

export default function TableSkeleton({
  rows = 6,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <SkeletonCard className="overflow-hidden p-0">
      <TableGridSkeleton rows={rows} columns={columns} />
    </SkeletonCard>
  );
}
