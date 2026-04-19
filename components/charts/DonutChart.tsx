"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export interface DonutSlice {
  name: string
  kg: number
  percent: number
}

interface DonutChartProps {
  data: DonutSlice[]
  title?: string
  height?: number
}

const COLORS = ["#A08060", "#8B6914", "#C4956A", "#6B4F2A", "#D4B896", "#B8935A", "#7A5C3A"]

interface TooltipPayloadItem {
  name: string
  value: number
  payload: DonutSlice
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const item = payload[0]
  if (!item) return null
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #D4C4A8",
        borderRadius: "12px",
        padding: "8px 12px",
        fontSize: "13px",
        color: "#2C1810",
      }}
    >
      <p className="font-semibold">{item.name}</p>
      <p>{item.payload.kg.toFixed(1)} กก.</p>
      <p>{item.payload.percent.toFixed(1)}%</p>
    </div>
  )
}

interface LegendPayloadItem {
  value: string
  color: string
  payload: DonutSlice
}

interface CustomLegendProps {
  payload?: LegendPayloadItem[]
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-[#2C1810]">
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 2,
              background: entry.color,
              flexShrink: 0,
            }}
          />
          <span>{entry.value}</span>
          <span className="text-[#A08060]">
            {entry.payload.kg.toFixed(1)} กก. ({entry.payload.percent.toFixed(1)}%)
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function DonutChart({ data, height = 300 }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#A08060]">
        ไม่มีข้อมูล
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="kg"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
