INSERT INTO categories (name, type, icon, color, is_default)
SELECT '转账', 'income', '⇄', '#0ea5e9', 1
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE name = '转账' AND type = 'income'
);
