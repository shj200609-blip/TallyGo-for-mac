import { select } from './db'
import type { MonthlyReport, TrendPoint } from '../types'

export async function getMonthlyReport(month: string): Promise<MonthlyReport> {
  const income = await select<{ total: number }>(
    `SELECT COALESCE(SUM(amount),0) as total FROM records WHERE type='income' AND substr(record_date,1,7)=?`,
    [month]
  )
  const expense = await select<{ total: number }>(
    `SELECT COALESCE(SUM(amount),0) as total FROM records WHERE type='expense' AND substr(record_date,1,7)=?`,
    [month]
  )
  const byCategory = await select<MonthlyReport['byCategory'][number]>(
    `SELECT c.id, c.name, c.icon, c.color, SUM(r.amount) as total, COUNT(r.id) as count
     FROM records r JOIN categories c ON r.category_id = c.id
     WHERE r.type='expense' AND substr(r.record_date,1,7)=?
     GROUP BY c.id ORDER BY total DESC`,
    [month]
  )
  const byAccount = await select<MonthlyReport['byAccount'][number]>(
    `SELECT a.id, a.name, a.icon,
            COALESCE(SUM(CASE WHEN r.type='income' THEN r.amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN r.type='expense' THEN r.amount ELSE 0 END), 0) as expense
     FROM accounts a
     LEFT JOIN records r ON r.account_id=a.id AND substr(r.record_date,1,7)=?
     GROUP BY a.id`,
    [month]
  )
  return {
    month,
    income: income[0]?.total ?? 0,
    expense: expense[0]?.total ?? 0,
    net: (income[0]?.total ?? 0) - (expense[0]?.total ?? 0),
    byCategory,
    byAccount,
  }
}

export async function getTrend(months = 12): Promise<TrendPoint[]> {
  return select<TrendPoint>(
    `SELECT substr(record_date,1,7) as month,
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
     FROM records
     WHERE record_date >= date('now', ?)
     GROUP BY month ORDER BY month`,
    [`-${months} months`]
  )
}
