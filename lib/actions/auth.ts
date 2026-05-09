"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { combineName, normalizeNameParts } from "@/lib/names";
import { namePartsSchema, registerSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function trimIdentityFields(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;

  const input = data as Record<string, unknown>;
  return {
    ...input,
    firstName:
      typeof input.firstName === "string" ? input.firstName.trim() : input.firstName,
    lastName:
      typeof input.lastName === "string" ? input.lastName.trim() : input.lastName,
    username:
      typeof input.username === "string" ? input.username.trim() : input.username,
  };
}

export async function registerUser(
  data: unknown,
): Promise<{ error?: string; success: boolean }> {
  const parsed = registerSchema.safeParse(trimIdentityFields(data));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
      success: false,
    };
  }

  const { firstName, lastName, username, password, groupId } = parsed.data;
  const name = normalizeNameParts(firstName, lastName);

  if (groupId) {
    const count = await prisma.user.count({ where: { groupId } });
    if (count >= 10)
      return { error: "กลุ่มนี้มีสมาชิกครบ 10 คนแล้ว", success: false };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        username,
        passwordHash,
        realName: name.fullName,
        firstName: name.firstName,
        lastName: name.lastName,
        role: "USER",
        groupId: groupId || null,
      },
    });
    return { success: true };
  } catch (err) {
    console.error(
      "registerUser failed:",
      err instanceof Error ? err.message : String(err),
    );
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: "ชื่อผู้ใช้นี้มีอยู่แล้ว", success: false };
    }
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่", success: false };
  }
}

export async function getLoginNameRequirement(): Promise<{
  firstName: string;
  lastName: string;
  needsUpdate: boolean;
}> {
  const session = await auth();
  if (!session) return { firstName: "", lastName: "", needsUpdate: false };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, realName: true },
  });
  if (!user) return { firstName: "", lastName: "", needsUpdate: false };

  return {
    firstName: user.firstName?.trim() || user.realName.trim(),
    lastName: user.lastName?.trim() ?? "",
    needsUpdate: !user.lastName?.trim(),
  };
}

export async function updateLoginName(data: unknown): Promise<{
  error?: string;
  success: boolean;
}> {
  const session = await auth();
  if (!session) return { error: "กรุณาเข้าสู่ระบบ", success: false };

  const parsed = namePartsSchema.safeParse(data);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
      success: false,
    };
  }

  const name = normalizeNameParts(parsed.data.firstName, parsed.data.lastName);
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: name.firstName,
      lastName: name.lastName,
      realName: combineName(name.firstName, name.lastName),
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/group");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");

  return { success: true };
}
