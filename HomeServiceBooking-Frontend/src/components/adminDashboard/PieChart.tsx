import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface PieChartProps {
  data: {
    name: string;
    value: number;
  }[];
  height?: number;
}

export function PieChart({ data, height = 300 }: PieChartProps) {
  // Custom colors for pie chart slices
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#6366f1",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
    "#f43f5e",
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} bookings`, "Count"]} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
