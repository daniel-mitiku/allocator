import type { SystemRole, College } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      systemRole: SystemRole
      collegeId: string
      college: College
    }
  }

  interface User {
    systemRole: SystemRole
    collegeId: string
    college: College
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    systemRole: SystemRole
    collegeId: string
    college: College
  }
}
