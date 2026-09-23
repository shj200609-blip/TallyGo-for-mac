export type RecordType = 'income' | 'expense' | 'transfer'

export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  icon: string | null
  color: string | null
  is_default: number
  created_at: string
}

export interface Account {
  id: number
  name: string
  type: string
  balance: number
  icon: string | null
  created_at: string
}

export interface Record {
  id: number
  type: RecordType
  amount: number
  category_id: number | null
  account_id: number | null
  transfer_to: number | null
  note: string | null
  record_date: string
  created_at: string
  updated_at: string
  category_name?: string
  category_icon?: string
  category_color?: string
  account_name?: string
  account_icon?: string
  transfer_to_name?: string
}

export interface RecordFilter {
  startDate?: string
  endDate?: string
  categoryId?: number | null
  accountId?: number | null
  type?: RecordType
  keyword?: string
  minAmount?: number | null
  maxAmount?: number | null
}

export interface Budget {
  id: number
  month: string
  category_id: number | null
  amount: number
  category_name?: string
  category_icon?: string
  category_color?: string
  spent: number
}

export interface MonthlyReport {
  month: string
  income: number
  expense: number
  net: number
  byCategory: Array<{
    id: number
    name: string
    icon: string | null
    color: string | null
    total: number
    count: number
  }>
  byAccount: Array<{
    id: number
    name: string
    icon: string | null
    income: number
    expense: number
  }>
}

export interface TrendPoint {
  month: string
  income: number
  expense: number
}
