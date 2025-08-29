import { prisma } from "@/prisma/client"
import { requireRole } from "@/lib/auth-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CollegesTable } from "./_components/colleges-table"

async function getColleges() {
  return await prisma.college.findMany({
    include: {
      _count: {
        select: {
          users: true,
          courses: true,
          rooms: true,
          programs: true,
          scheduleInstances: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export default async function CollegesPage() {
  await requireRole("SUPER_ADMIN")
  const colleges = await getColleges()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Colleges</h1>
          <p className="text-muted-foreground">Manage all colleges in the system</p>
        </div>
        <Button asChild>
          <Link href="/super-admin/colleges/create">Create College</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Colleges</CardTitle>
        </CardHeader>
        <CardContent>
          <CollegesTable colleges={colleges} />
        </CardContent>
      </Card>
    </div>
  )
}
