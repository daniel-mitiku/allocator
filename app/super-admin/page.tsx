import type React from "react"
import { prisma } from "@/prisma/client"
import { requireRole } from "@/lib/auth-utils"
import { Building2, Users, BookCopy, Calendar, Warehouse } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

async function getSuperAdminStats() {
  const [collegeCount, totalUsers, totalCourses, totalRooms, totalSchedules, activeSchedules] =
    await prisma.$transaction([
      prisma.college.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.course.count(),
      prisma.room.count(),
      prisma.scheduleInstance.count(),
      prisma.scheduleInstance.count({
        where: { NOT: { status: "COMPLETED" } },
      }),
    ])

  const colleges = await prisma.college.findMany({
    where: { isActive: true },
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
    take: 10,
  })

  return {
    collegeCount,
    totalUsers,
    totalCourses,
    totalRooms,
    totalSchedules,
    activeSchedules,
    colleges,
  }
}

export default async function SuperAdminDashboard() {
  await requireRole("SUPER_ADMIN")

  const { collegeCount, totalUsers, totalCourses, totalRooms, totalSchedules, activeSchedules, colleges } =
    await getSuperAdminStats()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all colleges and system-wide resources</p>
        </div>
        <Button asChild>
          <Link href="/super-admin/colleges/create">Create New College</Link>
        </Button>
      </div>

      {/* System-wide Stats */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        <StatCard
          title="Active Colleges"
          value={collegeCount}
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard title="Total Users" value={totalUsers} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard
          title="Total Courses"
          value={totalCourses}
          icon={<BookCopy className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Rooms"
          value={totalRooms}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Active Schedules"
          value={`${activeSchedules}/${totalSchedules}`}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Colleges Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Colleges Overview</CardTitle>
            <Button asChild variant="outline">
              <Link href="/super-admin/colleges">View All Colleges</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Rooms</TableHead>
                <TableHead>Programs</TableHead>
                <TableHead>Schedules</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.length > 0 ? (
                colleges.map((college) => (
                  <TableRow key={college.id}>
                    <TableCell className="font-medium">{college.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{college.code}</Badge>
                    </TableCell>
                    <TableCell>{college._count.users}</TableCell>
                    <TableCell>{college._count.courses}</TableCell>
                    <TableCell>{college._count.rooms}</TableCell>
                    <TableCell>{college._count.programs}</TableCell>
                    <TableCell>{college._count.scheduleInstances}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/super-admin/colleges/${college.id}`}>Manage</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin?college=${college.id}`}>View Dashboard</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No colleges found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
