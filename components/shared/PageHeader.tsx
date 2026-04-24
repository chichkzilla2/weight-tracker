interface PageHeaderProps {
  title: string
  subtitle?: React.ReactNode
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-3 pt-5 pb-3">
      <h1 className="text-xl font-bold text-[#E7EAF0]">{title}</h1>
      {subtitle && (
        <p className="text-sm text-[#A8AFBD] mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
