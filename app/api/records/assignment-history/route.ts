import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAssignmentHistorySchema } from "@/lib/schemas"

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

    // Validate query parameters
    const validatedParams = getAssignmentHistorySchema.parse(queryParams)

    // Build where clause
    const where: any = {}

    // Role-based access control
    if (session.user.systemRole !== "SUPER_ADMIN") {
      where.collegeId = session.user.collegeId
    } else if (validatedParams.collegeId) {
      where.collegeId = validatedParams.collegeId
    }

    if (validatedParams.personnelId) {
      where.personnelId = validatedParams.personnelId
    }

    if (validatedParams.courseId) {
      where.courseId = validatedParams.courseId
    }

    if (validatedParams.scheduleInstanceId) {
      where.scheduleInstanceId = validatedParams.scheduleInstanceId
    }

    if (validatedParams.startDate || validatedParams.endDate) {
      where.assignedAt = {}
      if (validatedParams.startDate) {
        where.assignedAt.gte = validatedParams.startDate
      }
      if (validatedParams.endDate) {
        where.assignedAt.lte = validatedParams.endDate
      }
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

    return NextResponse.json({
      success: true,
      records,
      total: records.length,
    })
  } catch (error) {
    console.error("Error fetching assignment history:", error)
    return NextResponse.json({ error: "Failed to fetch assignment history" }, { status: 500 })
  }
}
