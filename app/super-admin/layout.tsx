import type { ReactNode } from "react"
import { SuperAdminSidebar } from "./_components/sidebar"
import { SuperAdminHeader } from "./_components/header"

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar for Desktop */}
      <div className="hidden border-r bg-muted/40 md:block">
        <SuperAdminSidebar />
      </div>

      <div className="flex flex-col">
        {/* Header for Mobile */}
        <SuperAdminHeader />

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
