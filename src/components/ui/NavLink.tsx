'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  label: string
}

export default function NavLink({ href, label }: NavLinkProps) {
  const path = usePathname()
  const isActive = href.split('/').length <= 2 ? path === href : path.startsWith(href)

  return (
    <Link href={href} className={`px-3 py-1.5 rounded-lg text-sm transition-colors
      ${isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-muted hover:text-white hover:bg-raised'}`}>
      {label}
    </Link>
  )
}
