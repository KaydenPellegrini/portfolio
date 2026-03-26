import { notFound } from 'next/navigation'
import { ToastProvider } from '@/components/ui/Toast'
import { LayoutDashboard, Receipt, BarChart2, FileText, Settings, ShieldCheck } from 'lucide-react'
import NavLink from '@/components/ui/NavLink'
import MobileNavLink from '@/components/ui/MobileNavLink'

interface Props {
  children: React.ReactNode
  params: Promise<Record<string, string>>
}

export default async function TokenLayout({ children, params }: Props) {
  const { token } = await params
  const expectedToken = process.env.FINANCE_TOKEN

  if (!expectedToken || token !== expectedToken) {
    notFound()
  }

  const base = `/${token}`

  const navItems = [
    { href: base,                 icon: LayoutDashboard, label: 'Dashboard' },
    { href: `${base}/receipts`,   icon: Receipt,         label: 'Receipts'  },
    { href: `${base}/analytics`,  icon: BarChart2,       label: 'Analytics' },
    { href: `${base}/tax`,        icon: FileText,        label: 'Tax'       },
    { href: `${base}/settings`,   icon: Settings,        label: 'Settings'  },
  ]

  return (
    <ToastProvider>
      <div className="min-h-screen bg-bg flex flex-col">

        {/* Top nav — desktop */}
        <header className="hidden md:flex items-center justify-between px-6 py-3
          border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent" />
            <span className="text-sm font-bold text-white tracking-wide">FINANCE OS</span>
            <span className="text-[10px] text-muted bg-raised border border-border px-2 py-0.5 rounded-full">
              kayden.co.za
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} />
            ))}
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
          bg-surface/95 backdrop-blur-sm border-t border-border
          flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {navItems.map(({ href, icon, label }) => (
            <MobileNavLink key={href} href={href} icon={icon} label={label} />
          ))}
        </nav>
      </div>
    </ToastProvider>
  )
}
