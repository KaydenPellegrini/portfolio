import Image from 'next/image'
import { brand, footer } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Image
          src={brand.logo}
          alt={brand.name}
          width={1343}
          height={355}
          className={styles.footerLogo}
        />
        <div className={styles.footerMeta}>
          <p className={styles.footerCopy}>{footer.copyright}</p>
          <p className={styles.footerTagline}>{footer.tagline}</p>
        </div>
      </div>
    </footer>
  )
}
