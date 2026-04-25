import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  buildLeaderboardForMonth,
  getAllMonthKeys,
  formatMonthKeyThai,
  formatThaiDateTime,
} from "@/lib/calculations"
import LeaderboardClient from "./LeaderboardClient"
import PageHeader from "@/components/shared/PageHeader"

export default async function LeaderboardPage() {
  const session = await auth()
  if (!session) return null

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { groupId: true },
  })
  const currentGroupId = currentUser?.groupId ?? null

  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
      users: {
        select: {
          id: true,
          realName: true,
          weightEntries: {
            select: { id: true, userId: true, weight: true, recordedAt: true, createdAt: true },
          },
          waistEntries: {
            select: { id: true, userId: true, waist: true, recordedAt: true, createdAt: true },
          },
        },
      },
    },
  })

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`

  // --- Weight leaderboard ---
  const weightGroupData = groups.map((g) => ({
    id: g.id,
    name: g.name,
    users: g.users.map((u) => ({
      id: u.id,
      realName: u.realName,
      weightEntries: u.weightEntries,
    })),
  }))
  const allMonthKeys = getAllMonthKeys(weightGroupData)
  const monthlyLeaderboards = allMonthKeys.map((key) => ({
    monthKey: key,
    label: formatMonthKeyThai(key),
    leaderboard: buildLeaderboardForMonth(weightGroupData, key),
  }))

  // --- Waist leaderboard (map waist → weight-like for reuse) ---
  const waistGroupData = groups.map((g) => ({
    id: g.id,
    name: g.name,
    users: g.users.map((u) => ({
      id: u.id,
      realName: u.realName,
      weightEntries: u.waistEntries.map((e) => ({
        id: e.id,
        userId: e.userId,
        weight: parseFloat(e.waist.toString()),
        recordedAt: e.recordedAt.toISOString(),
        createdAt: e.createdAt.toISOString(),
      })),
    })),
  }))

  const waistMonthKeysSet = new Set<string>()
  for (const g of groups) {
    for (const u of g.users) {
      for (const e of u.waistEntries) {
        const d = new Date(e.recordedAt)
        waistMonthKeysSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
      }
    }
  }
  const waistMonthKeys = [...waistMonthKeysSet].sort()
  const waistMonthlyLeaderboards = waistMonthKeys.map((key) => ({
    monthKey: key,
    label: formatMonthKeyThai(key),
    leaderboard: buildLeaderboardForMonth(waistGroupData, key),
  }))

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader title="อันดับลดน้ำหนัก 🏆" subtitle="จัดอันดับกลุ่มตามเปอร์เซ็นต์น้ำหนักที่ลดได้" />
      <div className="px-4 pb-6">
        <LeaderboardClient
          monthlyLeaderboards={monthlyLeaderboards}
          currentMonthKey={currentMonthKey}
          prevMonthKey={prevMonthKey}
          currentGroupId={currentGroupId}
          lastUpdated={formatThaiDateTime(now)}
          waistMonthlyLeaderboards={waistMonthlyLeaderboards}
          waistCurrentMonthKey={currentMonthKey}
          waistPrevMonthKey={prevMonthKey}
        />
      </div>
    </div>
  )
}
