"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, TrendingUp, Award, Clock } from "lucide-react"
import type { AssignmentHistoryWithDetails } from "@/types"

interface RecordsStatsProps {
  records: AssignmentHistoryWithDetails[]
}

export function RecordsStats({ records }: RecordsStatsProps) {
  const stats = useMemo(() => {
    const uniquePersonnel = new Set(records.map((r) => r.personnelId)).size
    const uniqueCourses = new Set(records.map((r) => r.courseId)).size
    const uniqueSchedules = new Set(records.map((r) => r.scheduleInstanceId)).size

    const performanceStats = records.reduce(
      (acc, record) => {
        if (record.performance) {
          const perf = record.performance.toLowerCase()
          if (perf.includes("excellent") || perf.includes("outstanding")) {
            acc.excellent++
          } else if (perf.includes("good") || perf.includes("satisfactory")) {
            acc.good++
          } else if (perf.includes("needs improvement") || perf.includes("poor")) {
            acc.needsImprovement++
          }
        }
        return acc
      },
      { excellent: 0, good: 0, needsImprovement: 0 },
    )

    const recentAssignments = records.filter(
      (record) => new Date(record.assignedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ).length

    const topPersonnel = Object.entries(
      records.reduce(
        (acc, record) => {
          const key = record.personnel.name
          acc[key] = (acc[key] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    const topCourses = Object.entries(
      records.reduce(
        (acc, record) => {
          const key = `${record.course.code} - ${record.course.title}`
          acc[key] = (acc[key] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)

    return {
      totalRecords: records.length,
      uniquePersonnel,
      uniqueCourses,
      uniqueSchedules,
      performanceStats,
      recentAssignments,
      topPersonnel,
      topCourses,
    }
  }, [records])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRecords}</div>
          <p className="text-xs text-muted-foreground">Assignment records tracked</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Personnel</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniquePersonnel}</div>
          <p className="text-xs text-muted-foreground">Unique personnel with assignments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Courses</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueCourses}</div>
          <p className="text-xs text-muted-foreground">Courses with assignments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent (30d)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentAssignments}</div>
          <p className="text-xs text-muted-foreground">New assignments this month</p>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              <span className="text-sm">{stats.performanceStats.excellent}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Good</Badge>
              <span className="text-sm">{stats.performanceStats.good}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
              <span className="text-sm">{stats.performanceStats.needsImprovement}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Personnel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Most Active Personnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topPersonnel.map(([name, count], index) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm">
                  #{index + 1} {name}
                </span>
                <Badge variant="secondary">{count} assignments</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
