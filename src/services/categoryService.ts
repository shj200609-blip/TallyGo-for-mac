import { select, execute } from './db'
import type { Category } from '../types'

export async function listCategories(): Promise<Category[]> {
  return select<Category>('SELECT * FROM categories ORDER BY type, id')
}

export async function createCategory(cat: {
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
}): Promise<void> {
  await execute(
    'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
    [cat.name, cat.type, cat.icon ?? null, cat.color ?? null]
  )
}

export async function updateCategory(
  id: number,
  cat: Partial<{ name: string; icon: string; color: string }>
): Promise<void> {
  const fields: string[] = []
  const params: unknown[] = []
  if (cat.name !== undefined) {
    fields.push('name = ?')
    params.push(cat.name)
  }
  if (cat.icon !== undefined) {
    fields.push('icon = ?')
    params.push(cat.icon)
  }
  if (cat.color !== undefined) {
    fields.push('color = ?')
    params.push(cat.color)
  }
  if (fields.length === 0) return
  params.push(id)
  await execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params)
}

export async function deleteCategory(id: number): Promise<{ ok: boolean; error?: string }> {
  const used = await select<{ c: number }>(
    'SELECT COUNT(*) as c FROM records WHERE category_id = ?',
    [id]
  )
  if (used[0]?.c > 0) {
    return { ok: false, error: `该分类下有 ${used[0].c} 条账单，无法删除` }
  }
  await execute('DELETE FROM budgets WHERE category_id = ?', [id])
  await execute('DELETE FROM categories WHERE id = ?', [id])
  return { ok: true }
}
