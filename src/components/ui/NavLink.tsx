'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

interface NavLinkProps {
  href: string
  icon: LucideIcon
  label: string
}

export default function NavLink({ href, icon: Icon, label }: NavLinkProps) {
  const path = usePathname()
  // exact match for dashboard root, prefix match for sub-pages
  const isActive = href.split('/').length <= 2
    ? path === href
    : path.startsWith(href)

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
        ${isActive
          ? 'bg-accent/10 text-accent border border-accent/20'
          : 'text-muted hover:text-white hover:bg-raised'}`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  )
}
