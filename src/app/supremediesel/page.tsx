import type { Metadata } from 'next'
import Header from '@/components/supremediesel/Header'
import Hero from '@/components/supremediesel/Hero'
import About from '@/components/supremediesel/About'
import Sectors from '@/components/supremediesel/Sectors'
import MissionVision from '@/components/supremediesel/MissionVision'
import Directors from '@/components/supremediesel/Directors'
import Contact from '@/components/supremediesel/Contact'
import Footer from '@/components/supremediesel/Footer'
import styles from './supremediesel.module.css'

export const metadata: Metadata = {
  title: 'Supreme Diesel | Bulk Diesel Supply Across South Africa',
  description:
    'Supreme Diesel supplies premium bulk diesel nationwide from the South of Johannesburg — competitive volume pricing and reliable delivery for mining, agriculture, logistics and industry.',
  openGraph: {
    title: 'Supreme Diesel | Bulk Diesel Supply Across South Africa',
    description:
      'Premium bulk diesel supplied nationwide from the South of Johannesburg. Competitive volume pricing for mining, agriculture, logistics and industry.',
    type: 'website',
    images: ['/supremediesel/hero-refinery.webp'],
  },
}

export default function SupremeDieselPage() {
  return (
    <main className={styles.page}>
      <Header />
      <Hero />
      <About />
      <Sectors />
      <MissionVision />
      <Directors />
      <Contact />
      <Footer />
    </main>
  )
}
