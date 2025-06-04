// types/nextauth.d.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth"
/* eslint-enable @typescript-eslint/no-unused-vars */

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
    }
  }
}