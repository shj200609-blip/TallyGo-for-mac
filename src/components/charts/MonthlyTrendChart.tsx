import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { TrendPoint } from '../../types'

interface Props {
  data: TrendPoint[]
  locale?: string
}

export default function MonthlyTrendChart({ data, locale = 'zh' }: Props) {
  if (!data.length) {
    return <div className="h-64 flex items-center justify-center text-sm text-slate-400">—</div>
  }
  const months = locale.startsWith('zh') ? '月' : ''
  const chartData = data.map((d) => ({
    month: d.month.slice(5) + months,
    income: d.income,
    expense: d.expense,
  }))
  const incomeLabel = locale.startsWith('zh') ? '收入' : 'Income'
  const expenseLabel = locale.startsWith('zh') ? '支出' : 'Expense'

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(v: number) => `¥${v.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="income" name={incomeLabel} fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name={expenseLabel} fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="income" name={incomeLabel} stroke="#059669" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="expense" name={expenseLabel} stroke="#e11d48" dot={false} strokeWidth={1.5} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
