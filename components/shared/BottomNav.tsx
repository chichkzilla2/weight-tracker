"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Trophy,
  BarChart2,
  User,
  BookOpen,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/leaderboard", label: "อันดับ", icon: Trophy },
  { href: "/group", label: "กลุ่ม", icon: Users },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/profile", label: "โปรไฟล์", icon: User },
  { href: "/how-to-use", label: "วิธีใช้", icon: BookOpen },
];

function getScale(index: number, hoveredIndex: number | null): number {
  if (hoveredIndex === null) return 1;
  const dist = Math.abs(index - hoveredIndex);
  if (dist === 0) return 1.5;
  if (dist === 1) return 1.2;
  return 1;
}

export default function BottomNav() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop: left sidebar */}
      <nav
        className="hidden lg:flex fixed left-0 top-0 h-full w-16 flex-col items-center justify-center gap-12 bg-[#171A20] border-r border-[#343A46] z-50 overflow-visible"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {navItems.map((item, index) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const scale = getScale(index, hoveredIndex);
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredIndex(index)}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "left center",
                transition: "transform 180ms ease",
                display: "block",
              }}
              className={
                isActive
                  ? "text-[#F59E0B]"
                  : "text-[#A8AFBD] hover:text-[#F59E0B]"
              }
            >
              <Icon size={28} />
            </Link>
          );
        })}
      </nav>

      {/* Mobile: collapsible sidebar */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="เปิดเมนู"
        className="lg:hidden fixed right-4 top-[calc(env(safe-area-inset-top,0px)+14px)] z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F59E0B]/25 bg-[#151820]/95 text-[#F59E0B] shadow-xl shadow-black/35 backdrop-blur-md transition-colors hover:bg-[#1C1F26]"
      >
        <Menu size={22} />
      </button>

      <div
        className={`lg:hidden fixed inset-0 z-[60] transition-opacity duration-200 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/55"
        />
        <nav
          className={`absolute left-0 top-0 h-full w-[min(82vw,20rem)] border-r border-[#F59E0B]/20 bg-[#151820]/98 px-4 pb-5 pt-[calc(env(safe-area-inset-top,0px)+18px)] shadow-2xl shadow-black/50 transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#F59E0B]">เมนู</p>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="ปิดเมนู"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-[#A8AFBD] transition-colors hover:bg-[#1C1F26] hover:text-[#F59E0B]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-[#F59E0B]/35 bg-[#F59E0B]/15 text-[#F59E0B]"
                      : "border-white/10 bg-[#0F1115]/70 text-[#E7EAF0] hover:border-[#F59E0B]/25 hover:text-[#F59E0B]"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
