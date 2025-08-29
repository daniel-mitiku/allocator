import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { DayOfWeek } from "@prisma/client"

const simpleSolverSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string(),
  endTime: z.string(),
})

export async function POST(request: NextRequest, { params }: { params: { scheduleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime } = simpleSolverSchema.parse(body)
    const { scheduleId } = params

    const schedule = await prisma.scheduleInstance.findUnique({
      where: { id: scheduleId },
      include: {
        college: true,
        courses: { include: { activityTemplates: true } },
        scheduledEvents: {
          where: {
            dayOfWeek,
            startTime,
          },
          include: {
            activityTemplate: { include: { course: true } },
            room: true,
            personnel: true,
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    if (session.user.systemRole !== "SUPER_ADMIN" && session.user.collegeId !== schedule.collegeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const historicalAssignments = await prisma.assignmentHistory.findMany({
      where: {
        collegeId: schedule.collegeId,
      },
      select: {
        personnelId: true,
        courseId: true,
        performance: true,
      },
    })

    // Create historical preference mapping
    const historicalMap = new Map<string, { count: number; avgPerformance: number }>()

    historicalAssignments.forEach((assignment) => {
      const key = `${assignment.personnelId}-${assignment.courseId}`
      const existing = historicalMap.get(key) || { count: 0, avgPerformance: 0 }

      const performanceScore =
        assignment.performance === "EXCELLENT"
          ? 5
          : assignment.performance === "GOOD"
            ? 4
            : assignment.performance === "AVERAGE"
              ? 3
              : 2

      historicalMap.set(key, {
        count: existing.count + 1,
        avgPerformance: (existing.avgPerformance * existing.count + performanceScore) / (existing.count + 1),
      })
    })

    const availablePersonnel = await prisma.user.findMany({
      where: {
        collegeId: schedule.collegeId,
        roles: { hasSome: ["INSTRUCTOR", "ASSISTANT"] },
        NOT: {
          scheduledEvents: {
            some: {
              dayOfWeek,
              startTime: { lte: startTime },
              endTime: { gt: startTime },
            },
          },
        },
      },
      include: {
        timeslotPreferences: {
          where: {
            scheduleInstanceId: scheduleId,
            resourceType: "PERSONNEL",
          },
          orderBy: { rank: "asc" },
        },
      },
    })

    // Existing available rooms query
    const availableRooms = await prisma.room.findMany({
      where: {
        collegeId: schedule.collegeId,
        NOT: {
          scheduledEvents: {
            some: {
              dayOfWeek,
              startTime: { lte: startTime },
              endTime: { gt: startTime },
            },
          },
        },
      },
      include: {
        timeslotPreferences: {
          where: {
            scheduleInstanceId: scheduleId,
            resourceType: "ROOM",
          },
          orderBy: { rank: "asc" },
        },
      },
    })

    const updates = []

    for (const event of schedule.scheduledEvents) {
      if (event.roomId && event.personnel.length > 0) continue

      // Room assignment (unchanged)
      if (!event.roomId && availableRooms.length > 0) {
        const preferredRoom =
          availableRooms.find((room) =>
            room.timeslotPreferences.some((pref) => pref.timeslotId === `${dayOfWeek}-${startTime}`),
          ) || availableRooms[0]

        if (preferredRoom) {
          updates.push(
            prisma.scheduledEvent.update({
              where: { id: event.id },
              data: { roomId: preferredRoom.id },
            }),
          )
          const index = availableRooms.indexOf(preferredRoom)
          availableRooms.splice(index, 1)
        }
      }

      if (event.personnel.length === 0 && availablePersonnel.length > 0) {
        const courseId = event.activityTemplate.course.id

        // Score personnel based on historical data and preferences
        const scoredPersonnel = availablePersonnel.map((person) => {
          const historicalKey = `${person.id}-${courseId}`
          const historical = historicalMap.get(historicalKey)

          let score = 0

          // Historical experience bonus (0-1)
          if (historical) {
            score += Math.min(historical.count * 0.2, 0.5) // Max 0.5 for experience
            score += historical.avgPerformance * 0.1 // Max 0.5 for performance
          }

          // Timeslot preference bonus (0-0.3)
          const hasTimePreference = person.timeslotPreferences.some(
            (pref) => pref.timeslotId === `${dayOfWeek}-${startTime}`,
          )
          if (hasTimePreference) {
            score += 0.3
          }

          return { person, score }
        })

        // Sort by score (highest first) and select the best candidate
        scoredPersonnel.sort((a, b) => b.score - a.score)
        const bestPersonnel = scoredPersonnel[0]?.person

        if (bestPersonnel) {
          updates.push(
            prisma.scheduledEvent.update({
              where: { id: event.id },
              data: {
                personnel: {
                  connect: { id: bestPersonnel.id },
                },
              },
            }),
          )
          const index = availablePersonnel.indexOf(bestPersonnel)
          availablePersonnel.splice(index, 1)
        }
      }
    }

    await Promise.all(updates)

    return NextResponse.json({
      success: true,
      message: `Enhanced allocation completed for ${schedule.scheduledEvents.length} events`,
      assignedEvents: schedule.scheduledEvents.length,
      historicalFactorsConsidered: historicalMap.size,
    })
  } catch (error) {
    console.error("Error running enhanced simple solver:", error)
    return NextResponse.json({ error: "Failed to run enhanced simple solver" }, { status: 500 })
  }
}
