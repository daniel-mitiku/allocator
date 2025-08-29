import type React from "react"
// lib/types.ts

import type {
  Prisma,
  Course,
  ActivityTemplate,
  User,
  Room,
  ScheduleInstance,
  Program,
  Batch,
  Section,
  Group,
  PersonnelPreference,
  ScheduledEvent,
  College,
  AssignmentHistory,
  SystemRole,
} from "@prisma/client"

// -----------------------------------------------------------------------------
// Type Definitions for Data Queries
//
// These types represent the shape of data returned by our server actions,
// which often include relations (e.g., a Course with its ActivityTemplates).
// We use Prisma.PromiseReturnType<T> to infer the return type of a function.
// -----------------------------------------------------------------------------

// --- Helper to infer Server Action return types ---
// This allows us to get the type of the `data` property from our server actions
type ServerActionData<T extends (...args: any) => any> = Prisma.PromiseReturnType<T> extends { data?: infer U }
  ? U
  : never

// --- Full Data Structures from `getAll...` or `get...ById` actions ---

export type CollegeWithStats = College & {
  _count: {
    users: number
    rooms: number
    courses: number
    programs: number
    scheduleInstances: number
  }
}

export type CollegeWithResources = College & {
  users: User[]
  rooms: Room[]
  courses: CourseWithTemplates[]
  programs: ProgramWithChildren[]
  scheduleInstances: ScheduleInstance[]
}

export type UserWithCollege = User & {
  college: College
}

export type RoomWithCollege = Room & {
  college: College
}

// A Course that includes its array of ActivityTemplates
export type CourseWithTemplates = Course & {
  activityTemplates: ActivityTemplate[]
}

export type CourseWithTemplatesAndCollege = CourseWithTemplates & {
  college: College
}

// A Program with its full nested hierarchy of children
export type ProgramWithChildren = Program & {
  batches: (Batch & {
    sections: (Section & {
      groups: Group[]
    })[]
  })[]
}

export type ProgramWithChildrenAndCollege = ProgramWithChildren & {
  college: College
}

// A comprehensive type for a single ScheduleInstance dashboard page.
// This includes all pooled resources, preferences, and the final schedule.
export type FullScheduleInstance = ScheduleInstance & {
  college: College
  courses: CourseWithTemplates[]
  sections: (Section & { batch: Batch & { program: Program } })[]
  personnel: User[]
  rooms: Room[]
  preferences: PersonnelPreference[]
  scheduledEvents: ScheduledEvent[]
  assignmentHistory: AssignmentHistory[]
}

export type AssignmentHistoryWithDetails = AssignmentHistory & {
  personnel: User
  course: Course
  activityTemplate: ActivityTemplate
  scheduleInstance: ScheduleInstance
  college: College
}

export type PersonnelAssignmentHistory = {
  personnelId: string
  personnelName: string
  assignments: (AssignmentHistory & {
    course: Course
    activityTemplate: ActivityTemplate
    scheduleInstance: ScheduleInstance
  })[]
}

export type TimeslotPreference = {
  time: string
  rank: number
  dayOfWeek?: string
}

export type TimeslotPreferenceRanking = {
  scheduleInstanceId: string
  preferences: TimeslotPreference[]
}

export type AvailableResourcesAtTimeslot = {
  dayOfWeek: string
  startTime: string
  endTime: string
  availableRooms: Room[]
  availablePersonnel: User[]
  assignedEvents: ScheduledEvent[]
}

export type ManualAllocationData = {
  scheduleInstance: FullScheduleInstance
  selectedTimeslot: {
    dayOfWeek: string
    startTime: string
    endTime: string
  }
  availableResources: AvailableResourcesAtTimeslot
}

// -----------------------------------------------------------------------------
// Prop Types for Components
//
// Define the props for our React components based on the data types above.
// -----------------------------------------------------------------------------

export type CollegeFormProps = {
  college?: College
  onSuccess: () => void
}

export type CollegesTableProps = {
  colleges: CollegeWithStats[]
}

export type CourseFormProps = {
  course?: CourseWithTemplates
  collegeId?: string // For college-specific course creation
  onSuccess: () => void
}

export type CoursesTableProps = {
  courses: CourseWithTemplates[]
  showCollege?: boolean // For SuperAdmin view
}

export type PersonnelFormProps = {
  user?: User
  collegeId?: string // For college-specific user creation
  onSuccess: () => void
}

export type PersonnelTableProps = {
  users: User[]
  showCollege?: boolean // For SuperAdmin view
}

export type RoomFormProps = {
  room?: Room
  collegeId?: string // For college-specific room creation
  onSuccess: () => void
}

export type RoomsTableProps = {
  rooms: Room[]
  showCollege?: boolean // For SuperAdmin view
}

export type ProgramStructureProps = {
  programs: ProgramWithChildren[]
  showCollege?: boolean // For SuperAdmin view
}

export type SchedulesListProps = {
  schedules: ScheduleInstance[]
  showCollege?: boolean // For SuperAdmin view
}

export type ResourceAssignmentProps = {
  schedule: FullScheduleInstance
  allCourses: Course[]
  allSections: (Section & { batch: Batch & { program: Program } })[]
  allPersonnel: User[]
  allRooms: Room[]
}

export type PreferenceSorterProps = {
  scheduleInstanceId: string
  personnelId: string
  // Get all activities available in this schedule for the user's role
  availableActivities: (ActivityTemplate & { course: Course })[]
  // Get existing preferences to pre-populate the sorter
  existingPreferences: PersonnelPreference[]
}

export type TimeslotPreferenceRankingProps = {
  scheduleInstanceId: string
  availableTimeslots: string[]
  existingPreferences: TimeslotPreference[]
  onSave: (preferences: TimeslotPreference[]) => void
}

export type ManualAllocationInterfaceProps = {
  scheduleInstance: FullScheduleInstance
  onEventUpdate: (eventId: string, updates: Partial<ScheduledEvent>) => void
  onEventCreate: (eventData: Omit<ScheduledEvent, "id">) => void
  onEventDelete: (eventId: string) => void
}

export type AssignmentHistoryTableProps = {
  history: AssignmentHistoryWithDetails[]
  showCollege?: boolean
  showPersonnel?: boolean
  showCourse?: boolean
}

export type ScheduleCalendarProps = {
  events: ScheduledEvent[]
  // We might also need the full context for displaying details on click
  scheduleContext: FullScheduleInstance
  isManualMode?: boolean // For manual allocation interface
  onTimeslotClick?: (dayOfWeek: string, startTime: string, endTime: string) => void
}

export type UserContext = {
  user: UserWithCollege
  systemRole: SystemRole
  collegeId: string
  canAccessCollege: (collegeId: string) => boolean
  isSuperAdmin: boolean
  isCollegeAdmin: boolean
}

export type AccessControlProps = {
  userContext: UserContext
  requiredRole?: SystemRole
  requiredCollegeId?: string
  children: React.ReactNode
}
