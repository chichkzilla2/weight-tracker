import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import WeightCard from "@/components/shared/WeightCard"
import WeightForm from "@/components/shared/WeightForm"
import HistoryClient from "@/components/shared/HistoryClient"
import PageHeader from "@/components/shared/PageHeader"

export default async function HomePage() {
  const session = await auth()
  if (!session) return null

  const latestEntry = await prisma.weightEntry.findFirst({
    where: { userId: session.user.id },
    orderBy: { recordedAt: "desc" },
  })

  const entriesAsc = await prisma.weightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { recordedAt: "asc" },
    take: 365,
  })

  const entriesDesc = await prisma.weightEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { recordedAt: "desc" },
    take: 365,
  })

  const serializedAsc = entriesAsc.map((e) => ({
    id: e.id,
    weight: parseFloat(e.weight.toString()),
    recordedAt: e.recordedAt.toISOString(),
  }))

  const serializedDesc = entriesDesc.map((e) => ({
    id: e.id,
    weight: parseFloat(e.weight.toString()),
    recordedAt: e.recordedAt.toISOString(),
  }))

  return (
    <div className="w-full max-w-lg mx-auto">
      <PageHeader
        title={`🏠 ${session.user.realName}`}
        subtitle={
          <span className="inline-block bg-[#EDE3D0] border border-[#D4C4A8] text-[#5C3D1E] text-xs font-semibold px-3 py-0.5 rounded-full mt-1">
            {session.user.groupName}
          </span>
        }
      />
      {/* Top section */}
      <div className="max-w-sm mx-auto space-y-3 mb-8">

        {/* Weight Card */}
        <WeightCard
          weight={latestEntry ? parseFloat(latestEntry.weight.toString()) : null}
          recordedAt={latestEntry?.recordedAt ?? null}
        />

        {/* Weight Form */}
        <WeightForm />
      </div>

      {/* Divider */}
      <div className="border-t border-[#EDE3D0] mb-5" />

      {/* History */}
      <h2 className="text-base font-bold text-[#5C3D1E] mb-3">ประวัติน้ำหนัก</h2>
      <HistoryClient entries={serializedAsc} allEntries={serializedDesc} />
    </div>
  )
}
