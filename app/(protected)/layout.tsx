import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import BottomNav from "@/components/shared/BottomNav"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen">
      <main className="pb-6 lg:pb-0 lg:pl-16 pt-6 px-4">{children}</main>
      <BottomNav />
    </div>
  )
}
