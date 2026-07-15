import { contact } from '@/data/supremeDiesel/content'
import styles from '@/app/supremediesel/supremediesel.module.css'
import Reveal from './Reveal'

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.48.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.12.57-.09 1.76-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.46 9.46 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.44 9.44 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.9.99 6.69 2.78a9.4 9.4 0 0 1 2.77 6.7c-.01 5.22-4.26 9.47-9.47 9.47zM20.52 3.45A11.36 11.36 0 0 0 12.04 0C5.6 0 .36 5.24.35 11.68c0 2.06.54 4.06 1.56 5.83L.25 24l6.64-1.74a11.66 11.66 0 0 0 5.15 1.31h.01c6.44 0 11.68-5.24 11.69-11.68a11.6 11.6 0 0 0-3.22-8.44z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="20" height="20">
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width="16" height="16">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function Contact() {
  const actions = [
    {
      label: 'Call us',
      value: contact.phoneDisplay,
      href: `tel:${contact.phoneE164}`,
      icon: <PhoneIcon />,
    },
    {
      label: 'WhatsApp',
      value: contact.phoneDisplay,
      href: `https://wa.me/${contact.whatsapp}`,
      icon: <WhatsAppIcon />,
    },
    {
      label: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
      icon: <MailIcon />,
    },
  ]

  return (
    <section className={`${styles.section} ${styles.contact}`} id="contact">
      <div className={styles.shell}>
        <div className={styles.contactGrid}>
          <Reveal>
            <p className={styles.eyebrow}>{contact.eyebrow}</p>
            <h2 className={styles.sectionTitle}>{contact.title}</h2>
            <p className={styles.contactLede}>{contact.lede}</p>
            <p className={styles.contactLocation}>
              <PinIcon />
              {contact.location}
            </p>
          </Reveal>

          <Reveal className={styles.contactActions}>
            {actions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={styles.contactAction}
                {...(action.href.startsWith('https')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                <span className={styles.contactIcon}>{action.icon}</span>
                <span>
                  <span className={styles.contactActionLabel}>{action.label}</span>
                  <p className={styles.contactActionValue}>{action.value}</p>
                </span>
                <span className={styles.contactActionArrow}>
                  <ArrowIcon />
                </span>
              </a>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  )
}
