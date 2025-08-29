"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, Users, BookCopy, Calendar, Warehouse, Settings, BarChart3, Shield, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

const navigation = [
  {
    name: "Dashboard",
    href: "/super-admin",
    icon: BarChart3,
  },
  {
    name: "Colleges",
    href: "/super-admin/colleges",
    icon: Building2,
  },
  {
    name: "All Users",
    href: "/super-admin/users",
    icon: Users,
  },
  {
    name: "All Courses",
    href: "/super-admin/courses",
    icon: BookCopy,
  },
  {
    name: "All Rooms",
    href: "/super-admin/rooms",
    icon: Warehouse,
  },
  {
    name: "All Schedules",
    href: "/super-admin/schedules",
    icon: Calendar,
  },
  {
    name: "System Settings",
    href: "/super-admin/settings",
    icon: Settings,
  },
  {
    name: "Access Control",
    href: "/super-admin/access-control",
    icon: Shield,
  },
]

export function SuperAdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/super-admin" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span>Super Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", isActive && "bg-muted font-medium text-primary")}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
      <div className="mt-auto p-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
