import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:tallygo.db')
  }
  return db
}

export async function select<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const database = await getDb()
  return database.select<T[]>(sql, params as (string | number | null)[])
}

export async function execute(sql: string, params: unknown[] = []): Promise<number> {
  const database = await getDb()
  const result = await database.execute(sql, params as (string | number | null)[])
  return result.rowsAffected
}
