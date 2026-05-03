export interface UserWithEntries {
  id: string
  realName: string
  weightEntries: WeightEntryLike[]
}

export interface GroupWithUsers {
  id: string
  name: string
  users: UserWithEntries[]
}

export interface SerializedWeightEntry {
  id: string
  userId: string
  weight: number
  recordedAt: string
  createdAt: string
}

export interface SerializedUserWithEntries {
  id: string
  realName: string
  firstName?: string | null
  lastName?: string | null
  weightEntries: SerializedWeightEntry[]
}

export interface SerializedGroupWithUsers {
  id: string
  name: string
  users: SerializedUserWithEntries[]
}

export interface LeaderboardEntry {
  groupId: string
  groupName: string
  startTotal: number
  latestTotal: number
  lostKg: number
  lostPercent: number
  memberCount: number
}

/** Minimal shape required by weight calculation helpers — satisfied by both WeightEntry and SerializedWeightEntry */
interface WeightEntryLike {
  weight: { toString(): string } | number
  recordedAt: Date | string
}

/** Minimal group shape accepted by buildLeaderboardForMonth */
interface GroupLike {
  id: string
  name: string
  users: Array<{
    weightEntries: WeightEntryLike[]
  }>
}

function toNumber(d: { toString(): string } | number): number {
  if (typeof d === "number") return d
  return parseFloat(d.toString())
}

/**
 * Starting weight for a user = their earliest weight entry in the selected period.
 * If no entry in period, use their all-time earliest entry.
 * If no entry at all, return null (exclude from group total).
 */
export function getUserStartingWeight(
  entries: WeightEntryLike[],
  periodStart: Date
): number | null {
  if (entries.length === 0) return null

  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )

  // Try to find earliest entry within the period
  const inPeriod = sorted.filter(
    (e) => new Date(e.recordedAt) >= periodStart
  )

  if (inPeriod.length > 0) {
    return toNumber(inPeriod[0].weight)
  }

  // Fall back to all-time earliest
  return toNumber(sorted[0].weight)
}

/**
 * Latest weight for a user = their most recent weight entry across all time.
 * Returns null if no entries.
 */
export function getUserLatestWeight(entries: WeightEntryLike[]): number | null {
  if (entries.length === 0) return null

  const sorted = [...entries].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )

  return toNumber(sorted[0].weight)
}

/**
 * Returns a map of monthly weights for a user.
 * key = "YYYY-MM", value = last entry weight in that month
 */
export function getUserMonthlyWeights(entries: WeightEntryLike[]): Map<string, number> {
  const result = new Map<string, number>()

  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )

  for (const entry of sorted) {
    const date = new Date(entry.recordedAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const key = `${year}-${month}`
    // Overwrite with later entry (last entry per month wins)
    result.set(key, toNumber(entry.weight))
  }

  return result
}

/**
 * Sum of each user's latest weight for the given month.
 * If a user has no entry for the month, carry forward their last known weight.
 * If a user has no entry at all before/in this month, exclude them.
 */
export function getGroupMonthlyTotal(
  users: UserWithEntries[],
  month: string // "YYYY-MM"
): number {
  let total = 0

  for (const user of users) {
    const monthlyMap = getUserMonthlyWeights(user.weightEntries)

    // Find the carry-forward weight: last known weight on or before this month
    let weight: number | null = null

    // Sort months ascending
    const sortedMonths = [...monthlyMap.keys()].sort()

    for (const m of sortedMonths) {
      if (m <= month) {
        weight = monthlyMap.get(m) ?? null
      }
    }

    if (weight !== null) {
      total += weight
    }
  }

  return total
}

/**
 * Calculate group weight loss statistics.
 */
export function calculateGroupWeightLoss(
  startTotal: number,
  latestTotal: number
): { lostKg: number; lostPercent: number } {
  const lostKg = parseFloat((startTotal - latestTotal).toFixed(2))
  const lostPercent =
    startTotal > 0
      ? parseFloat(((lostKg / startTotal) * 100).toFixed(2))
      : 0

  return { lostKg, lostPercent }
}

/**
 * Build leaderboard for a specific month (cumulative from all-time start up to end of that month).
 * monthKey = "YYYY-MM"
 */
export function buildLeaderboardForMonth(
  groups: GroupWithUsers[] | SerializedGroupWithUsers[],
  monthKey: string
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []
  // Cast to GroupLike[] so the body can work against the common minimal shape
  const normalizedGroups = groups as unknown as GroupLike[]

  for (const group of normalizedGroups) {
    const allEntries = group.users.flatMap((u) => u.weightEntries)
    if (allEntries.length === 0) continue

    const sortedByDate = [...allEntries].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    const periodStart = new Date(sortedByDate[0].recordedAt)

    let startTotal = 0
    let latestTotal = 0
    let memberCount = 0

    for (const user of group.users) {
      const startW = getUserStartingWeight(user.weightEntries, periodStart)
      // For monthly view: latest = last entry on or before end of monthKey
      const monthlyMap = getUserMonthlyWeights(user.weightEntries)
      const sortedMonths = [...monthlyMap.keys()].sort()
      let monthWeight: number | null = null
      for (const m of sortedMonths) {
        if (m <= monthKey) monthWeight = monthlyMap.get(m) ?? null
      }

      if (startW !== null && monthWeight !== null) {
        startTotal += startW
        latestTotal += monthWeight
        memberCount++
      }
    }

    if (memberCount === 0) continue

    const { lostKg, lostPercent } = calculateGroupWeightLoss(startTotal, latestTotal)
    entries.push({
      groupId: group.id,
      groupName: group.name,
      startTotal: parseFloat(startTotal.toFixed(2)),
      latestTotal: parseFloat(latestTotal.toFixed(2)),
      lostKg,
      lostPercent,
      memberCount,
    })
  }

  return entries.sort((a, b) => b.lostPercent - a.lostPercent)
}

/**
 * Get all distinct "YYYY-MM" months that have weight entries, sorted ascending.
 */
export function getAllMonthKeys(groups: GroupWithUsers[]): string[] {
  const keys = new Set<string>()
  for (const group of groups) {
    for (const user of group.users) {
      for (const entry of user.weightEntries) {
        const d = new Date(entry.recordedAt)
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        keys.add(k)
      }
    }
  }
  return [...keys].sort()
}

/**
 * Format "YYYY-MM" to Thai month + year display, e.g. "ตุลาคม 2567"
 */
export function formatMonthKeyThai(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split("-")
  const month = parseInt(monthStr ?? "1", 10) - 1
  const year = toThaiYear(parseInt(yearStr ?? "2024", 10))
  return `${THAI_MONTHS[month]} ${year}`
}

/**
 * Build leaderboard sorted by lostPercent descending.
 */
export function buildLeaderboard(groups: GroupWithUsers[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []

  for (const group of groups) {
    // Collect all entry dates to find the earliest period start
    const allEntries = group.users.flatMap((u) => u.weightEntries)
    if (allEntries.length === 0) continue

    const sortedByDate = [...allEntries].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )

    const periodStart = new Date(sortedByDate[0].recordedAt)

    // Calculate start total and latest total per group
    let startTotal = 0
    let latestTotal = 0
    let memberCount = 0

    for (const user of group.users) {
      const startW = getUserStartingWeight(user.weightEntries, periodStart)
      const latestW = getUserLatestWeight(user.weightEntries)

      if (startW !== null && latestW !== null) {
        startTotal += startW
        latestTotal += latestW
        memberCount++
      }
    }

    if (memberCount === 0) continue

    const { lostKg, lostPercent } = calculateGroupWeightLoss(startTotal, latestTotal)

    entries.push({
      groupId: group.id,
      groupName: group.name,
      startTotal: parseFloat(startTotal.toFixed(2)),
      latestTotal: parseFloat(latestTotal.toFixed(2)),
      lostKg,
      lostPercent,
      memberCount,
    })
  }

  return entries.sort((a, b) => b.lostPercent - a.lostPercent)
}

// Thai date/month utilities
export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const

export function toThaiYear(ceYear: number): number {
  return ceYear + 543
}

export function toCEYear(thaiYear: number): number {
  return thaiYear - 543
}

export function formatThaiDate(date: Date): string {
  const d = date.getDate()
  const m = THAI_MONTHS[date.getMonth()]
  const y = toThaiYear(date.getFullYear())
  return `${d} ${m} ${y}`
}

export function formatThaiDateTime(date: Date): string {
  const dateStr = formatThaiDate(date)
  const h = String(date.getHours()).padStart(2, "0")
  const min = String(date.getMinutes()).padStart(2, "0")
  return `${dateStr} ${h}:${min} น.`
}
