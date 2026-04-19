interface PageHeaderProps {
  title: string
  subtitle?: React.ReactNode
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-3 pt-5 pb-3">
      <h1 className="text-xl font-bold text-[#2C1810]">{title}</h1>
      {subtitle && (
        <p className="text-sm text-[#A08060] mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
