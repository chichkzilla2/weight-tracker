import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

// Use pg adapter for local PostgreSQL
const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] ?? "" })
const prisma = new PrismaClient({ adapter })

const GROUP_NAMES = [
  "กลุ่มส้ม",
  "กลุ่มกล้วย",
  "กลุ่มแอปเปิ้ล",
  "กลุ่มองุ่น",
  "กลุ่มสับปะรด",
]

// Starting weights and monthly reduction rates per group (to create variation in leaderboard)
const GROUP_CONFIGS = [
  { startBase: 80, monthlyLoss: 1.8, variation: 5 },  // กลุ่มส้ม - best performer
  { startBase: 75, monthlyLoss: 1.2, variation: 6 },  // กลุ่มกล้วย
  { startBase: 85, monthlyLoss: 1.5, variation: 7 },  // กลุ่มแอปเปิ้ล
  { startBase: 70, monthlyLoss: 0.8, variation: 4 },  // กลุ่มองุ่น
  { startBase: 90, monthlyLoss: 1.0, variation: 8 },  // กลุ่มสับปะรด
]

const THAI_FIRST_NAMES = [
  "สมชาย", "สมหญิง", "วิชัย", "นภา", "ประเสริฐ",
  "รัตนา", "ธนาวุฒิ", "มาลี", "สุรชัย", "พิมพ์",
  "อนุชา", "นันทนา", "ภัทรพล", "กาญจนา", "วีรศักดิ์",
  "ศิริพร", "อภิชาต", "ลดาวัลย์", "นิพนธ์", "สุดา",
  "ชาญณรงค์", "วรรณา", "ธีรพงษ์", "พรทิพย์", "สมศักดิ์",
]

async function main() {
  console.log("Seeding database...")

  // Clean up existing data
  await prisma.weightEntry.deleteMany()
  await prisma.user.deleteMany()
  await prisma.group.deleteMany()

  // Create groups
  const groups = await Promise.all(
    GROUP_NAMES.map((name) =>
      prisma.group.create({ data: { name } })
    )
  )

  const defaultPassword = await bcrypt.hash("password123", 12)
  const adminPassword = await bcrypt.hash("admin123", 12)

  // Create admin user (attached to first group)
  const firstGroup = groups[0]
  if (!firstGroup) throw new Error("No groups created")

  await prisma.user.create({
    data: {
      username: "admin",
      passwordHash: adminPassword,
      realName: "ผู้ดูแลระบบ",
      role: "ADMIN",
      groupId: firstGroup.id,
    },
  })

  // Create 5 users per group
  let nameIdx = 0
  for (let gi = 0; gi < groups.length; gi++) {
    const group = groups[gi]
    if (!group) continue
    const config = GROUP_CONFIGS[gi]
    if (!config) continue
    const groupSlug = ["som", "kluay", "apple", "angoon", "sapparot"][gi] ?? `group${gi}`

    for (let ui = 0; ui < 5; ui++) {
      const firstName = THAI_FIRST_NAMES[nameIdx % THAI_FIRST_NAMES.length] ?? `คนที่${nameIdx}`
      nameIdx++

      // User's base starting weight with variation
      const userStartWeight =
        config.startBase + (Math.random() * config.variation * 2 - config.variation)

      const user = await prisma.user.create({
        data: {
          username: `user-${groupSlug}-${ui + 1}`,
          passwordHash: defaultPassword,
          realName: firstName,
          role: "USER",
          groupId: group.id,
        },
      })

      // Create 6 months of weight entries: Oct 2024 through Mar 2025
      const startMonth = new Date(2024, 9, 1) // October 2024

      for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        const entryDate = new Date(
          startMonth.getFullYear(),
          startMonth.getMonth() + monthOffset,
          // Vary the day slightly
          10 + Math.floor(Math.random() * 15)
        )

        // Weight decreases over time with slight random noise
        const noise = (Math.random() * 0.6 - 0.3)
        const weight =
          userStartWeight - config.monthlyLoss * monthOffset + noise

        await prisma.weightEntry.create({
          data: {
            userId: user.id,
            weight: parseFloat(Math.max(weight, 40).toFixed(1)),
            recordedAt: entryDate,
          },
        })
      }
    }
  }

  const userCount = await prisma.user.count()
  const entryCount = await prisma.weightEntry.count()
  const groupCount = await prisma.group.count()

  console.log(`Seeded: ${groupCount} groups, ${userCount} users (including admin), ${entryCount} weight entries`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
