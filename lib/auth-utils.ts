import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import type { SystemRole } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/auth/signin")
  }
  return session.user
}

export async function requireRole(requiredRole: SystemRole) {
  const user = await requireAuth()

  if (user.systemRole !== requiredRole && user.systemRole !== "SUPER_ADMIN") {
    redirect("/unauthorized")
  }

  return user
}

export async function requireCollegeAccess(collegeId: string) {
  const user = await requireAuth()

  // Super admins can access any college
  if (user.systemRole === "SUPER_ADMIN") {
    return user
  }

  // College admins and personnel can only access their own college
  if (user.collegeId !== collegeId) {
    redirect("/unauthorized")
  }

  return user
}

export function canAccessCollege(userCollegeId: string, userSystemRole: SystemRole, targetCollegeId: string): boolean {
  // Super admins can access any college
  if (userSystemRole === "SUPER_ADMIN") {
    return true
  }

  // Others can only access their own college
  return userCollegeId === targetCollegeId
}

export function canManageResource(
  userSystemRole: SystemRole,
  resourceCollegeId: string,
  userCollegeId: string,
): boolean {
  // Super admins can manage any resource
  if (userSystemRole === "SUPER_ADMIN") {
    return true
  }

  // College admins can manage resources in their college
  if (userSystemRole === "COLLEGE_ADMIN" && userCollegeId === resourceCollegeId) {
    return true
  }

  return false
}
