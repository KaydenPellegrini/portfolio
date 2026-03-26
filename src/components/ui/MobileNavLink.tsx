'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

export default function MobileNavLink({ href, label }: { href: string; label: string }) {
  const path = usePathname()
  const isActive = href.split('/').length <= 2 ? path === href : path.startsWith(href)

  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors
      ${isActive ? 'text-accent' : 'text-muted hover:text-white'}`}>
      <span className="text-[9px] font-medium">{label}</span>
    </Link>
  )
}
