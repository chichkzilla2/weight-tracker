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

  const groups = await prisma.group.findMany({
    include: {
      users: {
        include: { weightEntries: true },
      },
    },
  })

  const groupData = groups.map((g) => ({
    id: g.id,
    name: g.name,
    users: g.users.map((u) => ({
      id: u.id,
      realName: u.realName,
      weightEntries: u.weightEntries,
    })),
  }))

  // Get all months that have data
  const allMonthKeys = getAllMonthKeys(groupData)

  // Current month and previous month keys
  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`

  // Build leaderboard for each month
  const monthlyLeaderboards = allMonthKeys.map((key) => ({
    monthKey: key,
    label: formatMonthKeyThai(key),
    leaderboard: buildLeaderboardForMonth(groupData, key),
  }))

  return (
    <div className="max-w-4xl mx-auto w-full">
      <PageHeader title="อันดับลดน้ำหนัก 🏆" subtitle="จัดอันดับกลุ่มตามเปอร์เซ็นต์น้ำหนักที่ลดได้" />
      <div className="px-4 pb-6">
        <LeaderboardClient
          monthlyLeaderboards={monthlyLeaderboards}
          currentMonthKey={currentMonthKey}
          prevMonthKey={prevMonthKey}
          currentGroupId={session.user.groupId}
          lastUpdated={formatThaiDateTime(now)}
        />
      </div>
    </div>
  )
}
