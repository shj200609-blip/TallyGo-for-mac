import { select, execute } from './db'
import type { Budget } from '../types'

export async function listBudgets(month: string): Promise<Budget[]> {
  return select<Budget>(
    `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
            COALESCE((
              SELECT SUM(r.amount) FROM records r
              WHERE r.type='expense' AND substr(r.record_date,1,7)=b.month
                AND (b.category_id IS NULL OR r.category_id = b.category_id)
            ), 0) as spent
     FROM budgets b LEFT JOIN categories c ON b.category_id = c.id
     WHERE b.month = ?
     ORDER BY b.category_id IS NULL DESC, b.id`,
    [month]
  )
}

export async function saveBudget(budget: {
  month: string
  category_id: number | null
  amount: number
}): Promise<void> {
  await execute(
    `INSERT INTO budgets (month, category_id, amount) VALUES (?, ?, ?)
     ON CONFLICT(month, category_id) DO UPDATE SET amount = excluded.amount`,
    [budget.month, budget.category_id, budget.amount]
  )
}

export async function deleteBudget(id: number): Promise<void> {
  await execute('DELETE FROM budgets WHERE id = ?', [id])
}
