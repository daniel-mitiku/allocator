"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, BookOpen, Download, History } from "lucide-react"
import { AssignmentHistoryTable } from "./_components/assignment-history-table"
import { RecordsFilters } from "./_components/records-filters"
import { RecordsStats } from "./_components/records-stats"
import type { AssignmentHistoryWithDetails } from "@/types"

export default function RecordsPage() {
  const { data: session } = useSession()
  const [records, setRecords] = useState<AssignmentHistoryWithDetails[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AssignmentHistoryWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    collegeId: "",
    personnelId: "",
    courseId: "",
    scheduleInstanceId: "",
    startDate: "",
    endDate: "",
  })

  const isSuperAdmin = session?.user?.systemRole === "SUPER_ADMIN"

  useEffect(() => {
    loadRecords()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [records, filters])

  const loadRecords = async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (!isSuperAdmin && session?.user?.collegeId) {
        queryParams.set("collegeId", session.user.collegeId)
      }

      const response = await fetch(`/api/records/assignment-history?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setRecords(data.records)
      }
    } catch (error) {
      console.error("Failed to load records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...records]

    if (filters.collegeId) {
      filtered = filtered.filter((record) => record.collegeId === filters.collegeId)
    }
    if (filters.personnelId) {
      filtered = filtered.filter((record) => record.personnelId === filters.personnelId)
    }
    if (filters.courseId) {
      filtered = filtered.filter((record) => record.courseId === filters.courseId)
    }
    if (filters.scheduleInstanceId) {
      filtered = filtered.filter((record) => record.scheduleInstanceId === filters.scheduleInstanceId)
    }
    if (filters.startDate) {
      filtered = filtered.filter((record) => new Date(record.assignedAt) >= new Date(filters.startDate))
    }
    if (filters.endDate) {
      filtered = filtered.filter((record) => new Date(record.assignedAt) <= new Date(filters.endDate))
    }

    setFilteredRecords(filtered)
  }

  const handleExportRecords = async () => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value)
      })

      const response = await fetch(`/api/records/export?${queryParams}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `assignment-history-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Failed to export records:", error)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <History className="h-8 w-8" />
            Assignment Records
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and analyze historical personnel-course assignments across all scheduling instances
          </p>
        </div>
        <Button onClick={handleExportRecords} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Records
        </Button>
      </div>

      <RecordsStats records={filteredRecords} />

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            All Records
          </TabsTrigger>
          <TabsTrigger value="personnel" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            By Personnel
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            By Course
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            By Schedule
          </TabsTrigger>
        </TabsList>

        <RecordsFilters
          filters={filters}
          onFiltersChange={setFilters}
          isSuperAdmin={isSuperAdmin}
          onReset={() =>
            setFilters({
              collegeId: "",
              personnelId: "",
              courseId: "",
              scheduleInstanceId: "",
              startDate: "",
              endDate: "",
            })
          }
        />

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Assignment Records</span>
                <Badge variant="secondary">{filteredRecords.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentHistoryTable
                records={filteredRecords}
                isLoading={isLoading}
                showCollege={isSuperAdmin}
                showPersonnel={true}
                showCourse={true}
                showSchedule={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Personnel Assignment History</span>
                <Badge variant="secondary">{filteredRecords.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentHistoryTable
                records={filteredRecords}
                isLoading={isLoading}
                showCollege={isSuperAdmin}
                showPersonnel={true}
                showCourse={true}
                showSchedule={false}
                groupBy="personnel"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Course Assignment History</span>
                <Badge variant="secondary">{filteredRecords.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentHistoryTable
                records={filteredRecords}
                isLoading={isLoading}
                showCollege={isSuperAdmin}
                showPersonnel={true}
                showCourse={true}
                showSchedule={false}
                groupBy="course"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Schedule Assignment History</span>
                <Badge variant="secondary">{filteredRecords.length} records</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AssignmentHistoryTable
                records={filteredRecords}
                isLoading={isLoading}
                showCollege={isSuperAdmin}
                showPersonnel={true}
                showCourse={true}
                showSchedule={true}
                groupBy="schedule"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
