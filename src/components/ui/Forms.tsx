// Lightweight, consistent form primitives for the dark fintech theme

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}
export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
      <input
        {...props}
        style={{ backgroundColor: '#2C2C3E', border: `1px solid ${error ? '#E53E3E' : '#2E2E45'}`, borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', width: '100%', outline: 'none' }}
        className={className}
      />
      {error && <p style={{ fontSize: 12, color: '#E53E3E' }}>{error}</p>}
      {hint && !error && <p style={{ fontSize: 12, color: '#6B7280' }}>{hint}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}
export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>}
      <select
        {...props}
        style={{ backgroundColor: '#2C2C3E', border: `1px solid ${error ? '#E53E3E' : '#2E2E45'}`, borderRadius: 8, padding: '10px 12px', fontSize: 14, color: '#fff', width: '100%', outline: 'none', appearance: 'none' }}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: 12, color: '#E53E3E' }}>{error}</p>}
    </div>
  )
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  hint?: string
}
export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-10 h-5 rounded-full transition-colors mt-0.5
          ${checked ? 'bg-accent' : 'bg-raised border border-border'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
          ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <div>
        <p className="text-sm text-white">{label}</p>
        {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}
export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  const bgMap = { primary: '#00D4AA', secondary: '#2C2C3E', danger: 'transparent', ghost: 'transparent' }
  const colorMap = { primary: '#000', secondary: '#fff', danger: '#E53E3E', ghost: '#6B7280' }
  const borderMap = { primary: '#00D4AA', secondary: '#2E2E45', danger: '#E53E3E', ghost: 'transparent' }
  const padMap = { sm: '6px 12px', md: '10px 16px', lg: '12px 20px' }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{ backgroundColor: bgMap[variant], color: colorMap[variant], border: `1px solid ${borderMap[variant]}`, borderRadius: 10, padding: padMap[size], fontSize: size === 'sm' ? 12 : 14, fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled || loading ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 } as React.CSSProperties}
    >
      {loading && <span style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-border rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

export function Chip({ children, color = 'default' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    needs:   'bg-blue-500/15 text-blue-300 border-blue-500/20',
    wants:   'bg-purple-500/15 text-purple-300 border-purple-500/20',
    savings: 'bg-accent/15 text-accent border-accent/20',
    default: 'bg-raised text-muted border-border',
    red:     'bg-danger/15 text-danger border-danger/20',
    gold:    'bg-gold/15 text-gold border-gold/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color] ?? colors.default}`}>
      {children}
    </span>
  )
}
