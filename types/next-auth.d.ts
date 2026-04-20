import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      realName: string
      role: string
      groupId: string | null
      groupName: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
    realName?: string
    role?: string
    groupId?: string
    groupName?: string
  }
}
