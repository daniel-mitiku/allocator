"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Filter, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

interface RecordsFiltersProps {
  filters: {
    collegeId: string
    personnelId: string
    courseId: string
    scheduleInstanceId: string
    startDate: string
    endDate: string
  }
  onFiltersChange: (filters: any) => void
  isSuperAdmin: boolean
  onReset: () => void
}

export function RecordsFilters({ filters, onFiltersChange, isSuperAdmin, onReset }: RecordsFiltersProps) {
  const [colleges, setColleges] = useState<any[]>([])
  const [personnel, setPersonnel] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      const [collegesRes, personnelRes, coursesRes, schedulesRes] = await Promise.all([
        isSuperAdmin ? fetch("/api/colleges") : Promise.resolve({ ok: false }),
        fetch("/api/personnel"),
        fetch("/api/courses"),
        fetch("/api/schedules"),
      ])

      if (collegesRes.ok) {
        const collegesData = await collegesRes.json()
        setColleges(collegesData.colleges || [])
      }

      if (personnelRes.ok) {
        const personnelData = await personnelRes.json()
        setPersonnel(personnelData.personnel || [])
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.courses || [])
      }

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData.schedules || [])
      }
    } catch (error) {
      console.error("Failed to load filter options:", error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const activeFiltersCount = Object.values(filters).filter((value) => value !== "").length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                <X className="h-4 w-4 mr-2" />
                Clear All ({activeFiltersCount})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label htmlFor="college-filter">College</Label>
                <Select value={filters.collegeId} onValueChange={(value) => handleFilterChange("collegeId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All colleges" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All colleges</SelectItem>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="personnel-filter">Personnel</Label>
              <Select value={filters.personnelId} onValueChange={(value) => handleFilterChange("personnelId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All personnel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All personnel</SelectItem>
                  {personnel.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-filter">Course</Label>
              <Select value={filters.courseId} onValueChange={(value) => handleFilterChange("courseId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-filter">Schedule</Label>
              <Select
                value={filters.scheduleInstanceId}
                onValueChange={(value) => handleFilterChange("scheduleInstanceId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All schedules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All schedules</SelectItem>
                  {schedules.map((schedule) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(new Date(filters.startDate), "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                    onSelect={(date) => handleFilterChange("startDate", date ? date.toISOString().split("T")[0] : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(new Date(filters.endDate), "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                    onSelect={(date) => handleFilterChange("endDate", date ? date.toISOString().split("T")[0] : "")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
