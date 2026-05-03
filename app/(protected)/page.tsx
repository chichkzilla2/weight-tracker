import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import WeightCard from "@/components/shared/WeightCard";
import WeightForm from "@/components/shared/WeightForm";
import WaistCard from "@/components/shared/WaistCard";
import WaistForm from "@/components/shared/WaistForm";
import HistoryClient from "@/components/shared/HistoryClient";
import PageHeader from "@/components/shared/PageHeader";
import { combineName } from "@/lib/names";
import { getCurrentThaiMonthRange } from "@/lib/thai-month";

const MONTHLY_LIMIT_MESSAGE =
  "สามารถลงน้ำหนักและรอบเอวได้เดือนละ 1 ครั้งเท่านั้น หากต้องการแก้ไขข้อมูล กรุณาติดต่อผู้ดูแลระบบ";

export default async function HomePage() {
  const session = await auth();
  if (!session) return null;

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      realName: true,
      firstName: true,
      lastName: true,
      group: { select: { name: true } },
    },
  });
  const groupName = currentUser?.group?.name ?? null;
  const displayName = currentUser
    ? combineName(currentUser.firstName, currentUser.lastName, currentUser.realName)
    : session.user.realName;
  const { start: currentMonthStart, end: currentMonthEnd } =
    getCurrentThaiMonthRange();

  const [
    weightEntriesDesc,
    waistEntriesDesc,
  ] = await Promise.all([
    prisma.weightEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "desc" },
      take: 365,
      select: { id: true, weight: true, recordedAt: true },
    }),
    prisma.waistEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "desc" },
      take: 365,
      select: { id: true, waist: true, recordedAt: true },
    }),
  ]);

  const latestWeight = weightEntriesDesc[0] ?? null;
  const latestWaist = waistEntriesDesc[0] ?? null;
  const hasCurrentMonthWeight = weightEntriesDesc.some(
    (e) => e.recordedAt >= currentMonthStart && e.recordedAt < currentMonthEnd,
  );
  const hasCurrentMonthWaist = waistEntriesDesc.some(
    (e) => e.recordedAt >= currentMonthStart && e.recordedAt < currentMonthEnd,
  );
  const weightEntriesAsc = [...weightEntriesDesc].reverse();
  const waistEntriesAsc = [...waistEntriesDesc].reverse();

  const serializedWeightAsc = weightEntriesAsc.map((e) => ({
    id: e.id,
    weight: parseFloat(e.weight.toString()),
    recordedAt: e.recordedAt.toISOString(),
  }));
  const serializedWeightDesc = weightEntriesDesc.map((e) => ({
    id: e.id,
    weight: parseFloat(e.weight.toString()),
    recordedAt: e.recordedAt.toISOString(),
  }));
  const serializedWaistAsc = waistEntriesAsc.map((e) => ({
    id: e.id,
    waist: parseFloat(e.waist.toString()),
    recordedAt: e.recordedAt.toISOString(),
  }));
  const serializedWaistDesc = waistEntriesDesc.map((e) => ({
    id: e.id,
    waist: parseFloat(e.waist.toString()),
    recordedAt: e.recordedAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageHeader
        title={`🏠 ${displayName}`}
        subtitle={
          groupName ? (
            <span className="inline-block bg-[#242832]/65 border border-white/10 text-[#F59E0B] text-xs font-semibold px-3 py-0.5 rounded-full mt-1">
              {groupName}
            </span>
          ) : (
            <span className="inline-block bg-[#242832]/65 border border-white/10 text-[#6B7280] text-xs font-semibold px-3 py-0.5 rounded-full mt-1">
              ยังไม่มีกลุ่ม
            </span>
          )
        }
      />

      <div className="px-4 pb-6">
        {/* Responsive: desktop = 2×2 grid, mobile = weight card→form→waist card→form */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-3 mb-8 gap-x-8">
          <div className="order-1 md:order-1">
            <WeightCard
              weight={
                latestWeight ? parseFloat(latestWeight.weight.toString()) : null
              }
              recordedAt={latestWeight?.recordedAt ?? null}
            />
          </div>
          <div className="order-3 md:order-2 mt-6 md:mt-0">
            <WaistCard
              waist={
                latestWaist ? parseFloat(latestWaist.waist.toString()) : null
              }
              recordedAt={latestWaist?.recordedAt ?? null}
            />
          </div>
          <div className="order-2 md:order-3">
            <WeightForm
              disabled={hasCurrentMonthWeight}
              disabledMessage={MONTHLY_LIMIT_MESSAGE}
            />
          </div>
          <div className="order-4 md:order-4">
            <WaistForm
              disabled={hasCurrentMonthWaist}
              disabledMessage={MONTHLY_LIMIT_MESSAGE}
            />
          </div>
        </div>

        <div className="border-t border-white/10 mb-5" />

        <h2 className="text-base font-bold text-[#F59E0B] mb-3">ประวัติ</h2>
        <HistoryClient
          entries={serializedWeightAsc}
          allEntries={serializedWeightDesc}
          waistEntries={serializedWaistAsc}
          allWaistEntries={serializedWaistDesc}
        />
      </div>
    </div>
  );
}
