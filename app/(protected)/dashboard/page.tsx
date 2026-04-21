import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";
import PageHeader from "@/components/shared/PageHeader";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      users: {
        include: {
          weightEntries: {
            orderBy: { recordedAt: "asc" },
          },
        },
      },
    },
  });

  const serializedGroups = groups.map((g: (typeof groups)[number]) => ({
    id: g.id,
    name: g.name,
    users: g.users.map((u: (typeof g.users)[number]) => ({
      id: u.id,
      realName: u.realName,
      weightEntries: u.weightEntries.map(
        (e: (typeof u.weightEntries)[number]) => ({
          id: e.id,
          userId: e.userId,
          weight: parseFloat(e.weight.toString()),
          recordedAt: e.recordedAt.toISOString(),
          createdAt: e.createdAt.toISOString(),
        }),
      ),
    })),
  }));

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader
        title="📈 Dashboard"
        subtitle="ภาพรวมการลดน้ำหนักของทุกกลุ่ม"
      />
      <div className="px-4 pb-6">
        <DashboardClient
          groups={serializedGroups}
          allGroups={serializedGroups}
          userGroupId={session.user.groupId}
          userRole={session.user.role}
        />
      </div>
    </div>
  );
}
