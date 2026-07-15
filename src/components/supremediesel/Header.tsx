import Image from 'next/image'
import { brand } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Sectors', href: '#sectors' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Contact', href: '#contact' },
]

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="#top" aria-label={`${brand.name} home`}>
          <Image
            src={brand.logo}
            alt={brand.name}
            width={1343}
            height={355}
            className={styles.headerLogo}
            priority
          />
        </a>
        <nav className={styles.nav}>
          {links.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
          <a href="#contact" className={styles.navCta}>
            Request a quote
          </a>
        </nav>
      </div>
    </header>
  )
}
