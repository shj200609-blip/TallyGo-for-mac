import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from '../../store/theme'

interface Item {
  id: number
  name: string
  icon?: string | null
  color?: string | null
  total: number
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16', '#64748b', '#14b8a6']

export default function CategoryPieChart({ data, emptyText = '暂无支出数据' }: { data: Item[]; emptyText?: string }) {
  const theme = useTheme((s) => s.theme)
  const dark = theme === 'dark'

  if (!data.length) {
    return <div className="h-56 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">{emptyText}</div>
  }
  const chartData = data.map((d, i) => ({
    name: `${d.icon || ''} ${d.name}`.trim(),
    value: d.total,
    color: d.color || COLORS[i % COLORS.length],
  }))

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => `¥${v.toFixed(2)}`}
            contentStyle={{
              background: dark ? '#1e293b' : '#ffffff',
              border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
              borderRadius: 8,
              fontSize: 12,
              color: dark ? '#e2e8f0' : '#0f172a',
            }}
          />
          <Legend
            iconSize={10}
            formatter={(value: string) => (
              <span style={{ fontSize: 12, color: dark ? '#cbd5e1' : '#334155' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
