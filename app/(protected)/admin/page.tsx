import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const [users, groups] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      include: { group: true },
    }),
    prisma.group.findMany({ orderBy: { name: "asc" } }),
  ]);

  const serializedUsers = users.map((u: (typeof users)[number]) => ({
    id: u.id,
    username: u.username,
    realName: u.realName,
    role: u.role as string,
    groupId: u.groupId ?? "",
    groupName: u.group?.name ?? "ไม่มีกลุ่ม",
    createdAt: u.createdAt.toISOString(),
  }));

  const serializedGroups = groups.map((g: (typeof groups)[number]) => ({
    id: g.id,
    name: g.name,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#5C3D1E] mb-5">แผงผู้ดูแลระบบ</h1>
      <AdminClient users={serializedUsers} groups={serializedGroups} />
    </div>
  );
}
