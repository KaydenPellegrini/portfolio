// ─── Categories ──────────────────────────────────────────────────────────────
export interface CategoryDef {
  id: string
  label: string
  bucket: 'needs' | 'wants' | 'savings'
  receiptRequired: boolean
  defaultDeductible: boolean
  deductibleNote?: string
  builtIn: boolean
}

export const BUILT_IN_CATEGORIES: CategoryDef[] = [
  // NEEDS
  { id: 'rent_bond',         label: 'Rent / Bond',                 bucket: 'needs',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'groceries',         label: 'Groceries',                   bucket: 'needs',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'fuel',              label: 'Fuel',                        bucket: 'needs',   receiptRequired: true,  defaultDeductible: true,  deductibleNote: 'Keep logbook for business travel', builtIn: true },
  { id: 'utilities',         label: 'Utilities (elec/water)',      bucket: 'needs',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'internet_phone',    label: 'Internet / Phone',            bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'Proportional business-use % — set in Settings', builtIn: true },
  { id: 'insurance',         label: 'Insurance',                   bucket: 'needs',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'software_saas',     label: 'Software / SaaS Tools',       bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'Directly used for contract work', builtIn: true },
  { id: 'home_office',       label: 'Home Office Supplies',        bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'Office consumables, peripherals', builtIn: true },
  { id: 'professional_fees', label: 'Professional Fees',           bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'Accountant, attorney, tax practitioner', builtIn: true },
  { id: 'bank_charges',      label: 'Bank Charges',                bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'Business account charges, gateway fees', builtIn: true },
  { id: 'card_minimum',      label: 'Store Card Minimum Payment',  bucket: 'needs',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'medical',           label: 'Medical / Pharmacy',          bucket: 'needs',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'advertising',       label: 'Advertising / Marketing',     bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'LinkedIn, job boards, portfolio hosting', builtIn: true },
  { id: 'hardware',          label: 'Hardware / Equipment',        bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'May require depreciation schedule — flag for tax practitioner', builtIn: true },
  { id: 'prof_development',  label: 'Professional Development',    bucket: 'needs',   receiptRequired: false, defaultDeductible: true,  deductibleNote: 'Courses, certs, technical books for work', builtIn: true },
  { id: 'transport',         label: 'Public Transport / Uber',     bucket: 'needs',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  // WANTS
  { id: 'dining_out',        label: 'Dining Out / Takeaways',      bucket: 'wants',   receiptRequired: true,  defaultDeductible: false, builtIn: true },
  { id: 'entertainment',     label: 'Entertainment',               bucket: 'wants',   receiptRequired: true,  defaultDeductible: false, builtIn: true },
  { id: 'luxury_clothing',   label: 'Luxury Clothing / Accessories', bucket: 'wants', receiptRequired: true,  defaultDeductible: false, builtIn: true },
  { id: 'travel',            label: 'Travel / Accommodation',      bucket: 'wants',   receiptRequired: true,  defaultDeductible: false, builtIn: true },
  { id: 'hobbies',           label: 'Hobbies / Leisure',           bucket: 'wants',   receiptRequired: true,  defaultDeductible: false, builtIn: true },
  { id: 'subscriptions',     label: 'Subscriptions (streaming)',   bucket: 'wants',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'gym',               label: 'Gym / Fitness',               bucket: 'wants',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'personal_care',     label: 'Personal Care / Grooming',    bucket: 'wants',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'clothing_basic',    label: 'Clothing (Basic)',             bucket: 'wants',   receiptRequired: false, defaultDeductible: false, builtIn: true },
  // SAVINGS
  { id: 'emergency_fund',    label: 'Emergency Fund',              bucket: 'savings', receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'investment',        label: 'Investment / Unit Trust',     bucket: 'savings', receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'debt_overpayment',  label: 'Debt Overpayment',           bucket: 'savings', receiptRequired: false, defaultDeductible: false, builtIn: true },
  { id: 'retirement',        label: 'Retirement Annuity (RA)',     bucket: 'savings', receiptRequired: false, defaultDeductible: true,  deductibleNote: 'RA contributions deductible up to 27.5% of income / R350k max', builtIn: true },
  { id: 'tax_free_savings',  label: 'Tax-Free Savings Account',   bucket: 'savings', receiptRequired: false, defaultDeductible: false, builtIn: true },
]

export const BUCKETS = ['needs', 'wants', 'savings'] as const
export type Bucket = (typeof BUCKETS)[number]

export const BUCKET_LABELS: Record<Bucket, string> = {
  needs:   'Needs',
  wants:   'Wants',
  savings: 'Savings',
}

export const DEFAULT_BUCKET_ALLOCATION: Record<Bucket, number> = {
  needs:   50,
  wants:   30,
  savings: 20,
}

// ─── Payment Methods ─────────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { id: 'cash',          label: 'Cash' },
  { id: 'debit',         label: 'Debit Card' },
  { id: 'credit',        label: 'Credit Card' },
  { id: 'store_card',    label: 'Store Card' },
  { id: 'eft',           label: 'EFT / Transfer' },
  { id: 'instant_eft',   label: 'Instant EFT (Ozow/Peach)' },
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id']

// ─── Known Store Card Retailers ──────────────────────────────────────────────
export const STORE_CARD_RETAILERS = [
  'Woolworths', 'Edgars', 'Foschini (TFG)', 'RCS', 'Truworths',
  'Makro', 'Mr Price (MRP)', 'Builders Warehouse', 'Pick n Pay',
  'Sportsmans Warehouse', 'Hi-Fi Corporation', 'Incredible Connection',
  'PayJustNow', 'Payflex', 'Float',
]

// ─── Card types ───────────────────────────────────────────────────────────────
export const CARD_TYPES = ['general', 'store', 'bnpl'] as const
export type CardType = (typeof CARD_TYPES)[number]

// ─── Income types ─────────────────────────────────────────────────────────────
export const INCOME_TYPES = ['hours_base', 'bonus', 'other'] as const
export type IncomeType = (typeof INCOME_TYPES)[number]

// ─── Recurring frequencies ────────────────────────────────────────────────────
export const FREQUENCIES = ['monthly', 'weekly', 'bi-weekly', 'quarterly', 'annual'] as const
export type Frequency = (typeof FREQUENCIES)[number]

// ─── Tax reserve default ─────────────────────────────────────────────────────
export const DEFAULT_TAX_RESERVE_PCT = 0
export const DEFAULT_HOURLY_RATE_CENTS = 11000 // R110.00
