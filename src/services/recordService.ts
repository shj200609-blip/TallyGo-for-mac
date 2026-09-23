import { select, execute } from './db'
import type { Record, RecordFilter, RecordType } from '../types'

export async function listRecords(filter: RecordFilter = {}): Promise<Record[]> {
  const wheres: string[] = []
  const params: unknown[] = []
  if (filter.startDate) {
    wheres.push('r.record_date >= ?')
    params.push(filter.startDate)
  }
  if (filter.endDate) {
    wheres.push('r.record_date <= ?')
    params.push(filter.endDate)
  }
  if (filter.categoryId) {
    wheres.push('r.category_id = ?')
    params.push(filter.categoryId)
  }
  if (filter.accountId) {
    wheres.push('(r.account_id = ? OR r.transfer_to = ?)')
    params.push(filter.accountId, filter.accountId)
  }
  if (filter.type) {
    wheres.push('r.type = ?')
    params.push(filter.type)
  }
  if (filter.keyword) {
    wheres.push('r.note LIKE ?')
    params.push(`%${filter.keyword}%`)
  }
  if (filter.minAmount !== undefined && filter.minAmount !== null) {
    wheres.push('r.amount >= ?')
    params.push(filter.minAmount)
  }
  if (filter.maxAmount !== undefined && filter.maxAmount !== null) {
    wheres.push('r.amount <= ?')
    params.push(filter.maxAmount)
  }
  const where = wheres.length ? `WHERE ${wheres.join(' AND ')}` : ''
  return select<Record>(
    `SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
            a.name as account_name, a.icon as account_icon,
            ta.name as transfer_to_name
     FROM records r
     LEFT JOIN categories c ON r.category_id = c.id
     LEFT JOIN accounts a ON r.account_id = a.id
     LEFT JOIN accounts ta ON r.transfer_to = ta.id
     ${where}
     ORDER BY r.record_date DESC, r.id DESC
     LIMIT 1000`,
    params
  )
}

export interface RecordInput {
  type: RecordType
  amount: number
  category_id?: number | null
  account_id?: number | null
  transfer_to?: number | null
  note?: string
  record_date: string
}

async function applyBalance(rec: RecordInput, sign: 1 | -1) {
  if (rec.type === 'expense' && rec.account_id) {
    await execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [
      sign * -rec.amount,
      rec.account_id,
    ])
  } else if (rec.type === 'income' && rec.account_id) {
    await execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [
      sign * rec.amount,
      rec.account_id,
    ])
  } else if (rec.type === 'transfer' && rec.account_id && rec.transfer_to) {
    await execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [
      sign * -rec.amount,
      rec.account_id,
    ])
    await execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [
      sign * rec.amount,
      rec.transfer_to,
    ])
  }
}

export async function createRecord(rec: RecordInput): Promise<void> {
  await execute(
    `INSERT INTO records (type, amount, category_id, account_id, transfer_to, note, record_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      rec.type,
      rec.amount,
      rec.category_id ?? null,
      rec.account_id ?? null,
      rec.transfer_to ?? null,
      rec.note ?? null,
      rec.record_date,
    ]
  )
  await applyBalance(rec, 1)
}

export async function updateRecord(id: number, rec: RecordInput): Promise<void> {
  const old = await select<Record>('SELECT * FROM records WHERE id = ?', [id])
  if (!old[0]) return
  await applyBalance(
    {
      type: old[0].type,
      amount: old[0].amount,
      account_id: old[0].account_id,
      transfer_to: old[0].transfer_to,
      record_date: old[0].record_date,
    },
    -1
  )
  await execute(
    `UPDATE records SET type = ?, amount = ?, category_id = ?, account_id = ?,
     transfer_to = ?, note = ?, record_date = ?, updated_at = datetime('now','localtime')
     WHERE id = ?`,
    [
      rec.type,
      rec.amount,
      rec.category_id ?? null,
      rec.account_id ?? null,
      rec.transfer_to ?? null,
      rec.note ?? null,
      rec.record_date,
      id,
    ]
  )
  await applyBalance(rec, 1)
}

export async function deleteRecord(id: number): Promise<void> {
  const old = await select<Record>('SELECT * FROM records WHERE id = ?', [id])
  if (!old[0]) return
  await applyBalance(
    {
      type: old[0].type,
      amount: old[0].amount,
      account_id: old[0].account_id,
      transfer_to: old[0].transfer_to,
      record_date: old[0].record_date,
    },
    -1
  )
  await execute('DELETE FROM records WHERE id = ?', [id])
}
