import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env["DATABASE_URL"] ?? "" })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  await prisma.weightEntry.deleteMany()
  await prisma.user.deleteMany()
  await prisma.group.deleteMany()

  const group = await prisma.group.create({ data: { name: "แอดมิน" } })

  const passwordHash = await bcrypt.hash("admin123", 12)
  await prisma.user.create({
    data: {
      username: "admin",
      passwordHash,
      realName: "ผู้ดูแลระบบ",
      firstName: "ผู้ดูแลระบบ",
      lastName: null,
      role: "ADMIN",
      groupId: group.id,
    },
  })

  console.log("Done: 1 group, 1 admin user (admin / admin123)")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
