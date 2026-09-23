CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
  icon        TEXT,
  color       TEXT,
  is_default  INTEGER DEFAULT 0,
  created_at  TEXT    DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS accounts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  type        TEXT    NOT NULL DEFAULT 'cash',
  balance     REAL    NOT NULL DEFAULT 0,
  icon        TEXT,
  created_at  TEXT    DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS records (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  type         TEXT    NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount       REAL    NOT NULL CHECK (amount > 0),
  category_id  INTEGER REFERENCES categories(id),
  account_id   INTEGER REFERENCES accounts(id),
  transfer_to  INTEGER REFERENCES accounts(id),
  note         TEXT,
  record_date  TEXT    NOT NULL,
  created_at   TEXT    DEFAULT (datetime('now', 'localtime')),
  updated_at   TEXT    DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS budgets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  month       TEXT    NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  amount      REAL    NOT NULL CHECK (amount > 0),
  UNIQUE (month, category_id)
);

CREATE INDEX IF NOT EXISTS idx_records_date ON records(record_date);
CREATE INDEX IF NOT EXISTS idx_records_cat  ON records(category_id);
CREATE INDEX IF NOT EXISTS idx_records_acct ON records(account_id);

INSERT INTO categories (name, type, icon, color, is_default) VALUES
  ('餐饮', 'expense', '🍜', '#f59e0b', 1),
  ('交通', 'expense', '🚗', '#3b82f6', 1),
  ('购物', 'expense', '🛒', '#ec4899', 1),
  ('娱乐', 'expense', '🎮', '#8b5cf6', 1),
  ('居住', 'expense', '🏠', '#10b981', 1),
  ('医疗', 'expense', '💊', '#ef4444', 1),
  ('教育', 'expense', '📚', '#06b6d4', 1),
  ('通讯', 'expense', '📱', '#64748b', 1),
  ('其他支出', 'expense', '📦', '#94a3b8', 1),
  ('工资', 'income', '💰', '#22c55e', 1),
  ('奖金', 'income', '🎁', '#eab308', 1),
  ('理财', 'income', '📈', '#14b8a6', 1),
  ('其他收入', 'income', '💵', '#84cc16', 1);

INSERT INTO accounts (name, type, icon, balance) VALUES
  ('现金', 'cash', '💵', 0),
  ('银行卡', 'bank', '💳', 0),
  ('支付宝', 'alipay', '🔵', 0),
  ('微信', 'wechat', '🟢', 0);
