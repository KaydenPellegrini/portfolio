// Lightweight, consistent form primitives for the dark fintech theme

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}
export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>}
      <input
        {...props}
        className={`w-full bg-raised border rounded-lg px-3 py-2.5 text-sm text-white placeholder-muted
          focus:outline-none focus:ring-1 transition-colors
          ${error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-accent focus:border-accent'}
          ${className}`}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
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
      {label && <label className="text-xs font-medium text-muted uppercase tracking-wide">{label}</label>}
      <select
        {...props}
        className={`w-full bg-raised border rounded-lg px-3 py-2.5 text-sm text-white
          focus:outline-none focus:ring-1 transition-colors appearance-none cursor-pointer
          ${error ? 'border-danger focus:ring-danger' : 'border-border focus:ring-accent focus:border-accent'}
          ${className}`}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
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
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-accent text-black hover:bg-accent-dim focus:ring-accent',
    secondary: 'bg-raised border border-border text-white hover:border-accent/50 focus:ring-accent',
    danger:    'bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 focus:ring-danger',
    ghost:     'text-muted hover:text-white hover:bg-raised focus:ring-accent',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' }
  return (
    <button {...props} disabled={disabled || loading} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
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
