import { select, execute } from './db'
import type { Account } from '../types'

export async function listAccounts(): Promise<Account[]> {
  return select<Account>('SELECT * FROM accounts ORDER BY id')
}

export async function createAccount(acc: {
  name: string
  type: string
  icon?: string
  balance?: number
}): Promise<void> {
  await execute('INSERT INTO accounts (name, type, icon, balance) VALUES (?, ?, ?, ?)', [
    acc.name,
    acc.type,
    acc.icon ?? null,
    acc.balance ?? 0,
  ])
}

export async function updateAccount(
  id: number,
  acc: Partial<{ name: string; icon: string; balance: number }>
): Promise<void> {
  const fields: string[] = []
  const params: unknown[] = []
  if (acc.name !== undefined) {
    fields.push('name = ?')
    params.push(acc.name)
  }
  if (acc.icon !== undefined) {
    fields.push('icon = ?')
    params.push(acc.icon)
  }
  if (acc.balance !== undefined) {
    fields.push('balance = ?')
    params.push(acc.balance)
  }
  if (fields.length === 0) return
  params.push(id)
  await execute(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, params)
}

export async function deleteAccount(id: number): Promise<{ ok: boolean; error?: string }> {
  const used = await select<{ c: number }>(
    'SELECT COUNT(*) as c FROM records WHERE account_id = ? OR transfer_to = ?',
    [id, id]
  )
  if (used[0]?.c > 0) {
    return { ok: false, error: `该账户下有 ${used[0].c} 条流水，无法删除` }
  }
  await execute('DELETE FROM accounts WHERE id = ?', [id])
  return { ok: true }
}
