import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import { loginSchema } from "./validations"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { username: parsed.data.username },
          include: { group: true },
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          username: user.username,
          realName: user.realName,
          role: user.role,
          groupId: user.groupId,
          groupName: user.group.name,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as { username?: string }).username
        token.realName = (user as { realName?: string }).realName
        token.role = (user as { role?: string }).role
        token.groupId = (user as { groupId?: string }).groupId
        token.groupName = (user as { groupName?: string }).groupName
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.username = token.username as string
      session.user.realName = token.realName as string
      session.user.role = token.role as string
      session.user.groupId = token.groupId as string
      session.user.groupName = token.groupName as string
      return session
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
})
