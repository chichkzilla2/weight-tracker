import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import { loginSchema } from "./validations"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { username: parsed.data.username },
          select: {
            id: true,
            username: true,
            passwordHash: true,
            realName: true,
            role: true,
            groupId: true,
            group: { select: { name: true } },
          },
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          username: user.username,
          realName: user.realName,
          role: user.role,
          groupId: user.groupId ?? null,
          groupName: user.group?.name ?? null,
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
      session.user.groupId = (token.groupId as string | null) ?? null
      session.user.groupName = (token.groupName as string | null) ?? null
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60,
      },
    },
  },
  pages: { signIn: "/login" },
})
