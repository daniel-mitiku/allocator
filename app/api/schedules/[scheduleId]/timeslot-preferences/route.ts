import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const timeslotPreferenceSchema = z.object({
  preferences: z.array(
    z.object({
      timeslotId: z.string(),
      rank: z.number().min(1),
      resourceId: z.string(),
      resourceType: z.enum(["PERSONNEL", "ROOM"]),
    }),
  ),
})

export async function POST(request: NextRequest, { params }: { params: { scheduleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { preferences } = timeslotPreferenceSchema.parse(body)
    const { scheduleId } = params

    const schedule = await prisma.scheduleInstance.findUnique({
      where: { id: scheduleId },
      include: { college: true },
    })

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    if (session.user.systemRole !== "SUPER_ADMIN" && session.user.collegeId !== schedule.collegeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (preferences.length > 0) {
      const { resourceId, resourceType } = preferences[0]

      await prisma.timeslotPreference.deleteMany({
        where: {
          scheduleInstanceId: scheduleId,
          resourceId,
          resourceType,
        },
      })

      await prisma.timeslotPreference.createMany({
        data: preferences.map((pref) => ({
          ...pref,
          scheduleInstanceId: scheduleId,
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Timeslot preferences saved successfully",
    })
  } catch (error) {
    console.error("Error saving timeslot preferences:", error)
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { scheduleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get("resourceId")
    const resourceType = searchParams.get("resourceType")

    if (!resourceId || !resourceType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const preferences = await prisma.timeslotPreference.findMany({
      where: {
        scheduleInstanceId: params.scheduleId,
        resourceId,
        resourceType: resourceType as "PERSONNEL" | "ROOM",
      },
      orderBy: { rank: "asc" },
    })

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching timeslot preferences:", error)
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}
