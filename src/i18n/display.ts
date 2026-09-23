import { locales, type Locale, type MessageKey } from './messages'

/** 中文种子名称 → i18n key（仅默认分类/账户展示用，不改数据库） */
const SEED_NAME_KEYS: Record<string, MessageKey> = {
  餐饮: 'catFood',
  交通: 'catTransport',
  购物: 'catShopping',
  娱乐: 'catEntertainment',
  居住: 'catHousing',
  医疗: 'catMedical',
  教育: 'catEducation',
  通讯: 'catTelecom',
  其他支出: 'catOtherExpense',
  工资: 'catSalary',
  奖金: 'catBonus',
  理财: 'catInvestment',
  转账: 'catTransfer',
  其他收入: 'catOtherIncome',
  现金: 'cash',
  银行卡: 'bank',
  支付宝: 'alipay',
  微信: 'wechat',
}

/**
 * 展示用本地化名称：数据库中的中文种子名按当前语言映射；
 * 自定义名称原样返回。
 */
export function displayName(name: string | null | undefined, locale: Locale): string {
  if (!name) return ''
  if (locale === 'zh') return name
  const key = SEED_NAME_KEYS[name]
  return key ? locales.en[key] : name
}
