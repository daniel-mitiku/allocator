"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, User, BookOpen, Calendar, Building2, Clock } from "lucide-react"
import { format } from "date-fns"
import type { AssignmentHistoryWithDetails } from "@/types"

interface AssignmentHistoryTableProps {
  records: AssignmentHistoryWithDetails[]
  isLoading?: boolean
  showCollege?: boolean
  showPersonnel?: boolean
  showCourse?: boolean
  showSchedule?: boolean
  groupBy?: "personnel" | "course" | "schedule"
}

export function AssignmentHistoryTable({
  records,
  isLoading = false,
  showCollege = false,
  showPersonnel = true,
  showCourse = true,
  showSchedule = true,
  groupBy,
}: AssignmentHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<AssignmentHistoryWithDetails | null>(null)

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records

    const searchLower = searchTerm.toLowerCase()
    return records.filter(
      (record) =>
        record.personnel.name.toLowerCase().includes(searchLower) ||
        record.course.code.toLowerCase().includes(searchLower) ||
        record.course.title.toLowerCase().includes(searchLower) ||
        record.activityTemplate.title.toLowerCase().includes(searchLower) ||
        record.scheduleInstance.name.toLowerCase().includes(searchLower) ||
        (showCollege && record.college.name.toLowerCase().includes(searchLower)),
    )
  }, [records, searchTerm, showCollege])

  const groupedRecords = useMemo(() => {
    if (!groupBy) return { ungrouped: filteredRecords }

    const groups: Record<string, AssignmentHistoryWithDetails[]> = {}

    filteredRecords.forEach((record) => {
      let key: string
      switch (groupBy) {
        case "personnel":
          key = `${record.personnel.name} (${record.personnel.email})`
          break
        case "course":
          key = `${record.course.code} - ${record.course.title}`
          break
        case "schedule":
          key = record.scheduleInstance.name
          break
        default:
          key = "ungrouped"
      }

      if (!groups[key]) groups[key] = []
      groups[key].push(record)
    })

    return groups
  }, [filteredRecords, groupBy])

  const getPerformanceBadge = (performance?: string) => {
    if (!performance) return null

    const performanceLower = performance.toLowerCase()
    if (performanceLower.includes("excellent") || performanceLower.includes("outstanding")) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    }
    if (performanceLower.includes("good") || performanceLower.includes("satisfactory")) {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    }
    if (performanceLower.includes("needs improvement") || performanceLower.includes("poor")) {
      return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
    }
    return <Badge variant="outline">{performance}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading records...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search records by personnel, course, activity, or schedule..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Showing {filteredRecords.length} of {records.length} records
          {searchTerm && ` for "${searchTerm}"`}
        </span>
      </div>

      {/* Records Table/Groups */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No assignment records found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No historical assignments have been recorded yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([groupKey, groupRecords]) => (
            <Card key={groupKey}>
              {groupBy && groupKey !== "ungrouped" && (
                <div className="px-6 py-4 border-b bg-muted/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    {groupBy === "personnel" && <User className="h-4 w-4" />}
                    {groupBy === "course" && <BookOpen className="h-4 w-4" />}
                    {groupBy === "schedule" && <Calendar className="h-4 w-4" />}
                    {groupKey}
                    <Badge variant="secondary">{groupRecords.length} assignments</Badge>
                  </h3>
                </div>
              )}
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {showCollege && <TableHead>College</TableHead>}
                        {showPersonnel && <TableHead>Personnel</TableHead>}
                        {showCourse && <TableHead>Course</TableHead>}
                        <TableHead>Activity</TableHead>
                        {showSchedule && <TableHead>Schedule</TableHead>}
                        <TableHead>Assigned Date</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupRecords.map((record) => (
                        <TableRow key={record.id}>
                          {showCollege && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{record.college.name}</div>
                                  <div className="text-sm text-muted-foreground">{record.college.code}</div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {showPersonnel && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{record.personnel.name}</div>
                                  <div className="text-sm text-muted-foreground">{record.personnel.email}</div>
                                  <div className="flex gap-1 mt-1">
                                    {record.personnel.roles.map((role) => (
                                      <Badge key={role} variant="outline" className="text-xs">
                                        {role}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          {showCourse && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{record.course.code}</div>
                                  <div className="text-sm text-muted-foreground">{record.course.title}</div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="font-medium">{record.activityTemplate.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.activityTemplate.durationMinutes} minutes •{" "}
                              {record.activityTemplate.attendeeLevel}
                            </div>
                          </TableCell>
                          {showSchedule && (
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{record.scheduleInstance.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(record.scheduleInstance.startDate), "MMM yyyy")} -{" "}
                                    {format(new Date(record.scheduleInstance.endDate), "MMM yyyy")}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{format(new Date(record.assignedAt), "MMM dd, yyyy")}</div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(record.assignedAt), "HH:mm")}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getPerformanceBadge(record.performance)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Record Detail Modal would go here */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Assignment Record Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>
                  ×
                </Button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Personnel</label>
                    <p className="font-medium">{selectedRecord.personnel.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedRecord.personnel.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Course</label>
                    <p className="font-medium">
                      {selectedRecord.course.code} - {selectedRecord.course.title}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Activity</label>
                    <p className="font-medium">{selectedRecord.activityTemplate.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecord.activityTemplate.durationMinutes} minutes
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Schedule</label>
                    <p className="font-medium">{selectedRecord.scheduleInstance.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned Date</label>
                    <p className="font-medium">{format(new Date(selectedRecord.assignedAt), "PPP")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Performance</label>
                    {getPerformanceBadge(selectedRecord.performance) || (
                      <p className="text-muted-foreground">No performance notes</p>
                    )}
                  </div>
                </div>
                {selectedRecord.performance && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Performance Notes</label>
                    <p className="mt-1 p-3 bg-muted rounded-md">{selectedRecord.performance}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
