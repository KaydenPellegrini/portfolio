/**
 * Supreme Diesel — page content.
 *
 * All copy, imagery paths and contact details for the public `/supremediesel`
 * page live here so text can be edited without touching layout (same convention
 * as the other feature data folders in this repo).
 *
 * Images are prepared under `public/supremediesel/`.
 */

export type Sector = {
  id: string
  name: string
  blurb: string
  image: string
}

export type Director = {
  name: string
  role: string
  bio: string
  image: string
}

export type Stat = {
  value: string
  label: string
}

/** Brand + hero. */
export const brand = {
  name: 'Supreme Diesel',
  legal: 'Supreme Diesel (Pty) Ltd',
  logo: '/supremediesel/logo-light.png',
  hero: {
    image: '/supremediesel/hero-refinery.webp',
    eyebrow: 'Bulk diesel · Nationwide',
    title: 'Fuel that keeps South Africa moving',
    lede: 'Premium bulk diesel supplied nationwide from the South of Johannesburg — dependable volumes, competitive pricing, delivered where the work happens.',
    primaryCta: { label: 'Request a quote', href: '#contact' },
    secondaryCta: { label: 'Who we supply', href: '#sectors' },
  },
} as const

/** Headline proof points shown as a strip under the hero. */
export const stats: Stat[] = [
  { value: 'Nationwide', label: 'Delivery across all nine provinces' },
  { value: 'Bulk', label: 'Volume pricing below the pump' },
  { value: '24/7', label: 'Ordering and dispatch support' },
]

export const about = {
  eyebrow: 'About us',
  title: 'A bulk fuel partner, not just a supplier',
  paragraphs: [
    'Supreme Diesel is a trusted bulk diesel supplier based in the South of Johannesburg, proudly serving customers across South Africa. We provide premium quality diesel at competitive bulk prices that help businesses cut fuel costs without compromising on quality.',
    'We supply transport companies, logistics operators, construction firms, agricultural businesses, mining operations and industrial clients. Our focus is reliable nationwide delivery, straight-talking service and long-term relationships with every client we fuel.',
  ],
  image: '/supremediesel/about-fleet.webp',
  imageAlt: 'Haul trucks lined up at golden hour',
}

export const sectorsIntro = {
  eyebrow: 'Who we supply',
  title: 'Built for the industries that run on diesel',
  lede: 'From open-pit mines to farm lands and long-haul fleets — we keep the tanks full so the work never stops.',
}

export const sectors: Sector[] = [
  {
    id: 'mining',
    name: 'Mining',
    blurb: 'Keeping haul trucks, excavators and generators fuelled on site, around the clock.',
    image: '/supremediesel/sector-mining.webp',
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    blurb: 'Seasonal and standing supply for tractors, irrigation and harvest fleets.',
    image: '/supremediesel/sector-agriculture.webp',
  },
  {
    id: 'logistics',
    name: 'Logistics & Transport',
    blurb: 'Bulk supply that keeps long-haul and distribution fleets on schedule.',
    image: '/supremediesel/sector-logistics.webp',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    blurb: 'Dependable volumes for plants, refineries and heavy industry operations.',
    image: '/supremediesel/sector-industrial.webp',
  },
]

export const missionVision = {
  mission: {
    label: 'Mission',
    text: 'Deliver affordable, dependable diesel backed by exceptional service — so our clients spend less on fuel and more on growth.',
  },
  vision: {
    label: 'Vision',
    text: "Become South Africa's preferred nationwide bulk diesel supplier, known for reliability, fair pricing and relationships that last.",
  },
}

export const directorsIntro = {
  eyebrow: 'Leadership',
  title: 'The people behind the pump',
}

export const directors: Director[] = [
  {
    name: 'Keanu Edwards',
    role: 'Director',
    bio: 'Providing leadership, innovation and strategic direction to ensure Supreme Diesel delivers exceptional service and value throughout South Africa.',
    image: '/supremediesel/director-keanu.webp',
  },
  {
    name: 'Ronald De Klerk',
    role: 'Commercial Lead',
    bio: 'Committed to operational excellence, customer satisfaction and delivering dependable nationwide diesel supply solutions.',
    image: '/supremediesel/director-ronald.webp',
  },
]

/**
 * Contact — static panel, no backend. Numbers are formatted for display and for
 * `tel:` / `wa.me` links (E.164, South Africa +27).
 */
export const contact = {
  eyebrow: 'Get in touch',
  title: 'Request a quote',
  lede: 'Tell us your volumes and delivery area and we will come back with a competitive bulk price. Call, WhatsApp or email — whatever is fastest for you.',
  phoneDisplay: '083 519 6300',
  phoneE164: '+27835196300',
  whatsapp: '27835196300',
  email: 'ronmeister22@gmail.com',
  location: 'South of Johannesburg · Serving all of South Africa',
}

export const footer = {
  copyright: `© ${new Date().getFullYear()} ${brand.legal}. All rights reserved.`,
  tagline: 'Bulk diesel supply · Nationwide delivery',
}
