"use client"

import { useSession } from "next-auth/react"
import type { SystemRole } from "@prisma/client"
import type { ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: SystemRole
  requiredCollegeId?: string
  fallback?: ReactNode
}

export function RoleGuard({ children, requiredRole, requiredCollegeId, fallback }: RoleGuardProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return (
      fallback || (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You must be logged in to access this content.</AlertDescription>
        </Alert>
      )
    )
  }

  const user = session.user

  // Check role requirement
  if (requiredRole && user.systemRole !== requiredRole && user.systemRole !== "SUPER_ADMIN") {
    return (
      fallback || (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access this content.</AlertDescription>
        </Alert>
      )
    )
  }

  // Check college access requirement
  if (requiredCollegeId && user.systemRole !== "SUPER_ADMIN" && user.collegeId !== requiredCollegeId) {
    return (
      fallback || (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have access to this college's resources.</AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
