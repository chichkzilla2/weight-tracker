interface GroupBadgeProps {
  name: string | null | undefined
  className?: string
}

export default function GroupBadge({ name, className = "" }: GroupBadgeProps) {
  if (!name) {
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#242832]/65 text-[#6B7280] border border-white/10 ${className}`}>
        ยังไม่มีกลุ่ม
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#242832]/65 text-[#F59E0B] border border-white/10 ${className}`}>
      {name}
    </span>
  )
}
