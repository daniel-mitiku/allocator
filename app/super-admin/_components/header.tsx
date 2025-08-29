"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SuperAdminSidebar } from "./sidebar"

export function SuperAdminHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <SuperAdminSidebar />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold">Super Admin Panel</h1>
      </div>
    </header>
  )
}
