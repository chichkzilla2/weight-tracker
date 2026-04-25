"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/actions/auth";
import { GlassSelect } from "@/components/shared/GlassSelect";

interface Group {
  id: string;
  name: string;
}

interface Props {
  groups: Group[];
}

export default function RegisterForm({ groups }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      groupId: formData.get("groupId") as string,
    };

    try {
      const result = await registerUser(data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/login?registered=1");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏋️</div>
          <h1 className="text-2xl font-bold text-[#F59E0B] mb-2">
            Weight Tracker
          </h1>
          <p className="text-[#A8AFBD] text-sm">
            สมัครสมาชิกเพื่อเริ่มต้นติดตามสุขภาพ
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupId" className="text-[#F59E0B] font-medium">
                กลุ่ม{" "}
                <span className="text-[#A8AFBD] font-normal text-xs">
                  (ไม่บังคับ)
                </span>
              </Label>
              <GlassSelect
                name="groupId"
                defaultValue=""
                options={[
                  { value: "", label: "ไม่เลือกกลุ่ม (สามารถเลือกภายหลังได้)" },
                  ...groups.map((g) => ({ value: g.id, label: g.name })),
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#F59E0B] font-medium">
                ชื่อจริง
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="กรอกชื่อจริง"
                required
                autoComplete="given-name"
                className="border-white/10 focus:border-[#F59E0B] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#F59E0B] font-medium">
                นามสกุล
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="กรอกนามสกุล"
                required
                autoComplete="family-name"
                className="border-white/10 focus:border-[#F59E0B] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#F59E0B] font-medium">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้"
                required
                autoComplete="username"
                className="border-white/10 focus:border-[#F59E0B] rounded-xl"
              />
              <p className="text-xs text-[#A8AFBD]">
                ชื่อผู้ใช้ขั้นต่ำ 3 ตัวอักษร
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F59E0B] font-medium">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="กรอกรหัสผ่าน"
                required
                autoComplete="new-password"
                className="border-white/10 focus:border-[#F59E0B] rounded-xl"
              />
              <p className="text-xs text-[#A8AFBD]">
                รหัสผ่านขั้นต่ำ 6 ตัวอักษร
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[#F59E0B] font-medium"
              >
                ยืนยันรหัสผ่าน
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
                autoComplete="new-password"
                className="border-white/10 focus:border-[#F59E0B] rounded-xl"
              />
            </div>

            {error && (
              <div className="bg-[#2A1719] border border-[#5A3032] rounded-xl px-4 py-3">
                <p className="text-[#C77D7D] text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#111318] rounded-xl py-3 font-medium text-base transition-colors"
            >
              {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#A8AFBD] mt-4">
          มีบัญชีแล้ว?{" "}
          <Link
            href="/login"
            className="text-[#F59E0B] font-medium hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
