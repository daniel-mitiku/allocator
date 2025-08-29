"use client"

import { useState } from "react"
import type { College } from "@prisma/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type CollegeWithStats = College & {
  _count: {
    users: number
    courses: number
    rooms: number
    programs: number
    scheduleInstances: number
  }
}

interface CollegesTableProps {
  colleges: CollegeWithStats[]
}

export function CollegesTable({ colleges }: CollegesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (collegeId: string) => {
    setDeletingId(collegeId)
    // TODO: Implement delete functionality
    console.log("Delete college:", collegeId)
    setDeletingId(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Users</TableHead>
          <TableHead>Courses</TableHead>
          <TableHead>Rooms</TableHead>
          <TableHead>Programs</TableHead>
          <TableHead>Schedules</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {colleges.length > 0 ? (
          colleges.map((college) => (
            <TableRow key={college.id}>
              <TableCell className="font-medium">{college.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{college.code}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={college.isActive ? "default" : "secondary"}>
                  {college.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{college._count.users}</TableCell>
              <TableCell>{college._count.courses}</TableCell>
              <TableCell>{college._count.rooms}</TableCell>
              <TableCell>{college._count.programs}</TableCell>
              <TableCell>{college._count.scheduleInstances}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin?college=${college.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/super-admin/colleges/${college.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete College</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{college.name}"? This action cannot be undone and will affect
                          all associated resources.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(college.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deletingId === college.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="text-center">
              No colleges found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
