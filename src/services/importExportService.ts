import { save, open } from '@tauri-apps/plugin-dialog'
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs'
import { select, execute } from './db'

export async function exportData(format: 'json' | 'csv'): Promise<{ ok: boolean; error?: string; count?: number }> {
  const today = new Date().toISOString().slice(0, 10)
  const filePath = await save({
    defaultPath: `tallygo-backup-${today}.${format}`,
    filters: format === 'json' ? [{ name: 'JSON', extensions: ['json'] }] : [{ name: 'CSV', extensions: ['csv'] }],
  })
  if (!filePath) return { ok: false, error: '已取消' }

  const records = await select('SELECT * FROM records ORDER BY record_date, id')
  const categories = await select('SELECT * FROM categories')
  const accounts = await select('SELECT * FROM accounts')
  const budgets = await select('SELECT * FROM budgets')

  let content: string
  if (format === 'json') {
    content = JSON.stringify({ records, categories, accounts, budgets }, null, 2)
  } else {
    const header = 'id,type,amount,category_id,account_id,transfer_to,note,record_date'
    const rows = records.map((r: any) =>
      [
        r.id,
        r.type,
        r.amount,
        r.category_id ?? '',
        r.account_id ?? '',
        r.transfer_to ?? '',
        String(r.note ?? '').replace(/,/g, '，'),
        r.record_date,
      ].join(',')
    )
    content = [header, ...rows].join('\n')
  }
  await writeTextFile(filePath, content)
  return { ok: true, count: records.length }
}

export async function importData(format: 'json' | 'csv'): Promise<{ ok: boolean; error?: string; count?: number }> {
  const filePath = await open({
    multiple: false,
    filters: format === 'json' ? [{ name: 'JSON', extensions: ['json'] }] : [{ name: 'CSV', extensions: ['csv'] }],
  })
  if (!filePath || Array.isArray(filePath)) return { ok: false, error: '已取消' }

  const content = await readTextFile(filePath)
  let count = 0

  if (format === 'json') {
    const data = JSON.parse(content)
    if (Array.isArray(data.records)) {
      for (const r of data.records) {
        await execute(
          `INSERT INTO records (type, amount, category_id, account_id, transfer_to, note, record_date)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            r.type,
            r.amount,
            r.category_id ?? null,
            r.account_id ?? null,
            r.transfer_to ?? null,
            r.note ?? null,
            r.record_date,
          ]
        )
        count++
      }
    }
  } else {
    const lines = content.split(/\r?\n/).filter((l: string) => l.trim())
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      if (cols.length < 8) continue
      await execute(
        'INSERT INTO records (type, amount, category_id, account_id, transfer_to, note, record_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          cols[1],
          Number(cols[2]),
          cols[3] ? Number(cols[3]) : null,
          cols[4] ? Number(cols[4]) : null,
          cols[5] ? Number(cols[5]) : null,
          cols[6] || null,
          cols[7],
        ]
      )
      count++
    }
  }
  return { ok: true, count }
}
