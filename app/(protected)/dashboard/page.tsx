import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";
import PageHeader from "@/components/shared/PageHeader";
import { combineName } from "@/lib/names";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      users: {
        select: {
          id: true,
          realName: true,
          firstName: true,
          lastName: true,
          weightEntries: {
            orderBy: { recordedAt: "asc" },
            select: { id: true, userId: true, weight: true, recordedAt: true, createdAt: true },
          },
          waistEntries: {
            orderBy: { recordedAt: "asc" },
            select: { id: true, userId: true, waist: true, recordedAt: true, createdAt: true },
          },
        },
      },
    },
  });

  const serializedGroups = groups.map((g) => ({
    id: g.id,
    name: g.name,
    users: g.users.map((u) => ({
      id: u.id,
      realName: combineName(u.firstName, u.lastName, u.realName),
      weightEntries: u.weightEntries.map((e) => ({
        id: e.id,
        userId: e.userId,
        weight: parseFloat(e.weight.toString()),
        recordedAt: e.recordedAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
    })),
  }));

  // Waist data: map waist → weight field for reuse of calculation utilities
  const serializedGroupsWaist = groups.map((g) => ({
    id: g.id,
    name: g.name,
    users: g.users.map((u) => ({
      id: u.id,
      realName: combineName(u.firstName, u.lastName, u.realName),
      weightEntries: u.waistEntries.map((e) => ({
        id: e.id,
        userId: e.userId,
        weight: parseFloat(e.waist.toString()),
        recordedAt: e.recordedAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
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
          allGroupsWaist={serializedGroupsWaist}
        />
      </div>
    </div>
  );
}
