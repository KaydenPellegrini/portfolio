import { notFound } from 'next/navigation'
import { getSettings } from '@/actions/settings'
import { getCards } from '@/actions/cards'
import { getRecurrings } from '@/actions/settings'
import { SettingsClient } from '@/components/settings/SettingsClient'

interface Props { params: Promise<{ token: string }> }

export default async function SettingsPage({ params }: Props) {
  const { token } = await params
  if (!process.env.FINANCE_TOKEN || token !== process.env.FINANCE_TOKEN) notFound()

  const [settings, cards, recurrings] = await Promise.all([
    getSettings(),
    getCards(false),
    getRecurrings(),
  ])

  return <SettingsClient settings={settings} cards={cards} recurrings={recurrings} />
}
