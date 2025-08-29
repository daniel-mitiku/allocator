import type React from "react";
import { prisma } from "@/prisma/client";
import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import {
  BookCopy,
  CalendarIcon,
  Users,
  Warehouse,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScheduleStatus } from "@prisma/client";

async function getDashboardStats(collegeId: string, isSuperAdmin: boolean) {
  const whereClause = isSuperAdmin ? {} : { collegeId };

  const [courseCount, personnelCount, roomCount, scheduleCount] =
    await prisma.$transaction([
      prisma.course.count({ where: whereClause }),
      prisma.user.count({ where: whereClause }),
      prisma.room.count({ where: whereClause }),
      prisma.scheduleInstance.count({
        where: { ...whereClause, NOT: { status: "COMPLETED" } },
      }),
    ]);

  const activeSchedules = await prisma.scheduleInstance.findMany({
    where: { ...whereClause, NOT: { status: "COMPLETED" } },
    include: {
      college: true,
    },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  return {
    courseCount,
    personnelCount,
    roomCount,
    scheduleCount,
    activeSchedules,
  };
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ college?: string }>;
}) {
  const user = await requireAuth();

  const { college: searchedCollege } = await searchParams;
  let targetCollegeId = user.collegeId;
  let college = user.college;

  // Super admins can view any college via query params
  if (user.systemRole === "SUPER_ADMIN" && searchedCollege) {
    targetCollegeId = searchedCollege;
    const targetCollege = await prisma.college.findUnique({
      where: { id: searchedCollege },
    });
    if (!targetCollege) {
      redirect("/admin");
    }
    college = targetCollege;
  }

  // Regular users can only access their own college
  if (
    user.systemRole !== "SUPER_ADMIN" &&
    searchedCollege &&
    searchedCollege !== user.collegeId
  ) {
    redirect("/unauthorized");
  }

  const {
    courseCount,
    personnelCount,
    roomCount,
    scheduleCount,
    activeSchedules,
  } = await getDashboardStats(
    targetCollegeId,
    user.systemRole === "SUPER_ADMIN"
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            {user.systemRole === "SUPER_ADMIN"
              ? "College Dashboard"
              : "Dashboard"}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>
              {college.name} ({college.code})
            </span>
            {user.systemRole === "SUPER_ADMIN" && (
              <Badge variant="outline">Super Admin View</Badge>
            )}
          </div>
        </div>
        <Button asChild>
          <Link
            href={`/admin/schedules/create${
              searchedCollege ? `?college=${searchedCollege}` : ""
            }`}
          >
            Create New Schedule
          </Link>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard
          title="Active Schedules"
          value={scheduleCount}
          icon={<CalendarIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Courses"
          value={courseCount}
          icon={<BookCopy className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Personnel"
          value={personnelCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Rooms"
          value={roomCount}
          icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Active Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming & Active Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                {user.systemRole === "SUPER_ADMIN" && (
                  <TableHead>College</TableHead>
                )}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSchedules.length > 0 ? (
                activeSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.name}
                    </TableCell>
                    <TableCell>
                      {new Date(schedule.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    {user.systemRole === "SUPER_ADMIN" && (
                      <TableCell>
                        <Badge variant="outline">{schedule.college.code}</Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/schedules/${schedule.id}${
                            searchedCollege ? `?college=${searchedCollege}` : ""
                          }`}
                        >
                          Manage
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={user.systemRole === "SUPER_ADMIN" ? 5 : 4}
                    className="text-center"
                  >
                    No active schedules found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
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
  );
}

// Helper to style status badges
function getBadgeVariant(status: ScheduleStatus) {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "LOCKED":
      return "default";
    case "COMPLETED":
      return "outline";
    default:
      return "secondary";
  }
}
