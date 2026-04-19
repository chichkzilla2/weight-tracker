interface GroupBadgeProps {
  name: string
  className?: string
}

export default function GroupBadge({ name, className = "" }: GroupBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#EDE3D0] text-[#5C3D1E] border border-[#D4C4A8] ${className}`}
    >
      {name}
    </span>
  )
}
