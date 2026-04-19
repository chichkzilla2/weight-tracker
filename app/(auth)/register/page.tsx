import { prisma } from "@/lib/db"
import RegisterForm from "./RegisterForm"

export default async function RegisterPage() {
  let groups: { id: string; name: string }[] = []
  try {
    groups = await prisma.group.findMany({ orderBy: { name: "asc" } })
  } catch {
    // DB unavailable — form renders with empty group list
  }

  return <RegisterForm groups={groups} />
}
