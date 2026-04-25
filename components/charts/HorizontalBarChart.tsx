"use client";

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
} from "recharts";

interface ChartDataPoint {
  month?: string;
  name?: string;
  total?: number;
  value?: number;
}

export interface SeriesMeta {
  key: string;
  label: string;
  color: string;
}

interface EndLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: string | number | null;
  index?: number;
  payload?: ChartDataPoint;
}

interface HorizontalBarChartProps {
  data?: ChartDataPoint[];
  multiData?: Record<string, string | number>[];
  series?: SeriesMeta[];
  unit?: string;
  barColors?: string[];
  height?: number;
  endLabelKey?: "month" | "name" | "total" | "value";
  hideCategoryAxis?: boolean;
}

export default function HorizontalBarChart({
  data,
  multiData,
  series,
  unit = "กก.",
  barColors,
  height,
  endLabelKey,
  hideCategoryAxis = false,
}: HorizontalBarChartProps) {
  // Multi-series mode
  if (multiData && series && series.length > 0) {
    if (multiData.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-[#A8AFBD]">
          ไม่มีข้อมูล
        </div>
      );
    }

    const computedHeight =
      height ?? multiData.length * (series.length * 22 + 14) + 40;

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
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#242832"
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#A8AFBD" }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v: number) => `${v}${unit}`}
            />
            <YAxis
              type="category"
              dataKey="month"
              tick={{ fontSize: 12, fill: "#F59E0B" }}
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
                background: "rgba(23, 26, 32, 0.86)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#E7EAF0",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              formatter={(value) => (
                <span style={{ color: "#E7EAF0" }}>{value}</span>
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
                  formatter={(v) =>
                    typeof v === "number" ? v.toFixed(1) : String(v)
                  }
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Single-series mode (original behavior)
  const singleData = data ?? [];
  if (singleData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[#A8AFBD]">
        ไม่มีข้อมูล
      </div>
    );
  }

  const dataKey = singleData[0]?.value !== undefined ? "value" : "total";
  const categoryKey = singleData[0]?.name !== undefined ? "name" : "month";
  const computedHeight = height ?? singleData.length * 44 + 40;
  const values = singleData.map((row) => Number(row[dataKey] ?? 0));
  const xDomain: [number | string, number | string] =
    values.every((value) => value >= 0) ? [0, "auto"] : ["auto", "auto"];
  const renderEndLabel = (props: EndLabelProps) => {
    if (!endLabelKey) return <g />;
    const row =
      (typeof props.index === "number" ? singleData[props.index] : undefined) ??
      props.payload ??
      singleData.find((item) => item[endLabelKey] === props.value);
    if (!row) return <g />;
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const width = Number(props.width ?? 0);
    const height = Number(props.height ?? 0);
    const barValue = Number(row[dataKey] ?? 0);
    const label = row[endLabelKey];
    const isIncrease = barValue < 0;
    const displayValue =
      barValue === 0 ? `0${unit}` : `${barValue.toFixed(1)}${unit}`;

    return (
      <text
        x={isIncrease ? x - 6 : x + width + 6}
        y={y + height / 2 + 4}
        textAnchor={isIncrease ? "end" : "start"}
        style={{ fontSize: "11px", fill: "#F59E0B", fontWeight: 600 }}
      >
        {label} {displayValue}
      </text>
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={computedHeight}>
        <BarChart
          layout="vertical"
          data={singleData}
          margin={{
            top: 5,
            right: endLabelKey ? 170 : 60,
            left: hideCategoryAxis ? 0 : endLabelKey ? 120 : 10,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#242832"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#A8AFBD" }}
            tickLine={false}
            axisLine={false}
            domain={xDomain}
            tickFormatter={(v: number) => `${v}${unit}`}
          />
          <YAxis
            type="category"
            dataKey={categoryKey}
            tick={hideCategoryAxis ? false : { fontSize: 12, fill: "#F59E0B" }}
            tickLine={false}
            axisLine={false}
            width={hideCategoryAxis ? 0 : 50}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? [`${value.toFixed(1)} ${unit}`, ""]
                : [String(value), ""]
            }
            contentStyle={{
              background: "rgba(23, 26, 32, 0.86)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#E7EAF0",
            }}
          />
          <Bar
            dataKey={dataKey}
            fill="#F59E0B"
            radius={[0, 4, 4, 0]}
            barSize={24}
          >
            {barColors &&
              singleData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColors[index % barColors.length]}
                />
              ))}
            <LabelList
              dataKey={endLabelKey ?? dataKey}
              position="right"
              style={{ fontSize: "11px", fill: "#F59E0B", fontWeight: 600 }}
              content={
                endLabelKey
                  ? (props) => renderEndLabel(props as EndLabelProps)
                  : undefined
              }
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
