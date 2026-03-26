import { notFound } from 'next/navigation'
import { getTaxPageData, saveTaxSnapshot } from '@/actions/tax'
import { getSettings } from '@/actions/settings'
import { formatZAR, formatDate } from '@/lib/format'
import { TaxPageClient } from '@/components/tax/TaxPageClient'

interface Props {
  params: Promise<Record<string, string>>
}

export default async function TaxPage({ params }: Props) {
  const { token } = await params
  if (!process.env.FINANCE_TOKEN || token !== process.env.FINANCE_TOKEN) notFound()

  const settings = await getSettings()
  const taxYear = settings?.currentTaxYear ?? '2025/26'
  const data = await getTaxPageData(taxYear)

  return <TaxPageClient data={data} taxYear={taxYear} />
}
