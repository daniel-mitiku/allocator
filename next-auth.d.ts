import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { SystemRole } from "@prisma/client";

// Extend the built-in types
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      systemRole: SystemRole;
      collegeId: string;
      college: { id: string; name: string; code: string };
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the Credentials provider's `authorize` callback.
   */
  interface User extends DefaultUser {
    systemRole: SystemRole;
    collegeId: string;
    college: { id: string; name: string; code: string };
  }
}

declare module "next-auth/jwt" {
  /**
   * The shape of the JWT returned from `getToken`.
   */
  interface JWT {
    systemRole: SystemRole;
    collegeId: string;
    college: { id: string; name: string; code: string };
  }
}
