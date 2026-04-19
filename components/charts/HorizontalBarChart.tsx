"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
  Legend,
} from "recharts"

interface ChartDataPoint {
  month?: string
  name?: string
  total?: number
  value?: number
}

export interface SeriesMeta {
  key: string
  label: string
  color: string
}

interface HorizontalBarChartProps {
  data?: ChartDataPoint[]
  multiData?: Record<string, string | number>[]
  series?: SeriesMeta[]
  unit?: string
  barColors?: string[]
  height?: number
}

export default function HorizontalBarChart({
  data,
  multiData,
  series,
  unit = "กก.",
  barColors,
  height,
}: HorizontalBarChartProps) {
  // Multi-series mode
  if (multiData && series && series.length > 0) {
    if (multiData.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-[#A08060]">
          ไม่มีข้อมูล
        </div>
      )
    }

    const computedHeight = height ?? multiData.length * (series.length * 22 + 14) + 40

    return (
      <div className="w-full">
        <ResponsiveContainer width="100%" height={computedHeight}>
          <BarChart
            layout="vertical"
            data={multiData}
            margin={{ top: 5, right: 70, left: 10, bottom: 5 }}
            barCategoryGap="20%"
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDE3D0" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#A08060" }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => `${v}${unit}`}
            />
            <YAxis
              type="category"
              dataKey="month"
              tick={{ fontSize: 12, fill: "#5C3D1E" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip
              formatter={(value, name) =>
                typeof value === "number"
                  ? [`${value.toFixed(1)} ${unit}`, name]
                  : [String(value), name]
              }
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #D4C4A8",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#2C1810",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              formatter={(value) => (
                <span style={{ color: "#2C1810" }}>{value}</span>
              )}
            />
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                radius={[0, 4, 4, 0]}
                barSize={18}
              >
                <LabelList
                  dataKey={s.key}
                  position="right"
                  style={{ fontSize: "10px", fill: s.color, fontWeight: 600 }}
                  formatter={(v) => (typeof v === "number" ? v.toFixed(1) : String(v))}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Single-series mode (original behavior)
  const singleData = data ?? []
  if (singleData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#A08060]">
        ไม่มีข้อมูล
      </div>
    )
  }

  const dataKey = singleData[0]?.value !== undefined ? "value" : "total"
  const categoryKey = singleData[0]?.name !== undefined ? "name" : "month"
  const computedHeight = height ?? singleData.length * 44 + 40

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={computedHeight}>
        <BarChart
          layout="vertical"
          data={singleData}
          margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDE3D0" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#A08060" }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => `${v}${unit}`}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            tick={{ fontSize: 12, fill: "#5C3D1E" }}
            tickLine={false}
            axisLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? [`${value.toFixed(1)} ${unit}`, ""]
                : [String(value), ""]
            }
            contentStyle={{
              background: "#FFFFFF",
              border: "1px solid #D4C4A8",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#2C1810",
            }}
          />
          <Bar dataKey={dataKey} fill="#5C3D1E" radius={[0, 4, 4, 0]} barSize={24}>
            {barColors &&
              singleData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColors[index % barColors.length]}
                />
              ))}
            <LabelList
              dataKey={dataKey}
              position="right"
              style={{ fontSize: "11px", fill: "#5C3D1E", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
