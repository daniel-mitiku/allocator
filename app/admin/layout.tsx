import type { ReactNode } from "react"
import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { Sidebar } from "./_components/sidebar"
import { Header } from "./_components/header"

export default async function AdminLayout({
  children,
  searchParams,
}: {
  children: ReactNode
  searchParams?: { college?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Only allow COLLEGE_ADMIN and SUPER_ADMIN access
  if (user.systemRole === "PERSONNEL") {
    redirect("/unauthorized")
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar for Desktop */}
      <div className="hidden border-r bg-muted/40 md:block">
        <Sidebar user={user} />
      </div>

      <div className="flex flex-col">
        {/* Header for Mobile */}
        <Header user={user} />

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
