import { notFound } from 'next/navigation'
import { getAnalyticsData } from '@/actions/tax'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'

interface Props { params: Promise<{ token: string }> }

export default async function AnalyticsPage({ params }: Props) {
  const { token } = await params
  if (!process.env.FINANCE_TOKEN || token !== process.env.FINANCE_TOKEN) notFound()

  const data = await getAnalyticsData(12)
  return <AnalyticsClient expenses={data.expenses} incomeEntries={data.incomeEntries} />
}
