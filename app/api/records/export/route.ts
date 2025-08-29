import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = {
      collegeId: searchParams.get("collegeId") || undefined,
      personnelId: searchParams.get("personnelId") || undefined,
      courseId: searchParams.get("courseId") || undefined,
      scheduleInstanceId: searchParams.get("scheduleInstanceId") || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
    }

    // Build where clause (same logic as GET route)
    const where: any = {}

    if (session.user.systemRole !== "SUPER_ADMIN") {
      where.collegeId = session.user.collegeId
    } else if (queryParams.collegeId) {
      where.collegeId = queryParams.collegeId
    }

    if (queryParams.personnelId) where.personnelId = queryParams.personnelId
    if (queryParams.courseId) where.courseId = queryParams.courseId
    if (queryParams.scheduleInstanceId) where.scheduleInstanceId = queryParams.scheduleInstanceId

    if (queryParams.startDate || queryParams.endDate) {
      where.assignedAt = {}
      if (queryParams.startDate) where.assignedAt.gte = queryParams.startDate
      if (queryParams.endDate) where.assignedAt.lte = queryParams.endDate
    }

    const records = await prisma.assignmentHistory.findMany({
      where,
      include: {
        personnel: true,
        course: true,
        activityTemplate: true,
        scheduleInstance: true,
        college: true,
      },
      orderBy: {
        assignedAt: "desc",
      },
    })

    // Generate CSV content
    const csvHeaders = [
      "Assignment Date",
      "College",
      "Personnel Name",
      "Personnel Email",
      "Personnel Roles",
      "Course Code",
      "Course Title",
      "Activity Template",
      "Activity Duration",
      "Schedule Instance",
      "Performance",
    ]

    const csvRows = records.map((record) => [
      format(new Date(record.assignedAt), "yyyy-MM-dd HH:mm:ss"),
      record.college.name,
      record.personnel.name,
      record.personnel.email,
      record.personnel.roles.join("; "),
      record.course.code,
      record.course.title,
      record.activityTemplate.title,
      `${record.activityTemplate.durationMinutes} minutes`,
      record.scheduleInstance.name,
      record.performance || "",
    ])

    const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="assignment-history-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting assignment history:", error)
    return NextResponse.json({ error: "Failed to export assignment history" }, { status: 500 })
  }
}
