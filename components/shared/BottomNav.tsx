"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, BarChart2, User, BookOpen, Users } from "lucide-react";
import { useState } from "react";

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

      {/* Mobile: floating pill bottom bar */}
      <nav
        className="lg:hidden fixed left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+15px)] h-16 flex items-center justify-around rounded-4xl bg-[#1C1F26]/50 backdrop-blur-md border border-[#F59E0B]/20 shadow-xl z-50 overflow-visible"
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
                transformOrigin: "bottom center",
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
    </>
  );
}
