import { notFound } from 'next/navigation'
import { ensureCurrentMonth, getMonthDashboard, getUpcomingRecurrings, getMonths } from '@/actions/month'
import { getCardsSummary } from '@/actions/cards'
import { currentMonthKey } from '@/lib/format'
import { Dashboard } from '@/components/dashboard/Dashboard'

interface Props {
  params: Promise<{ token: string }>
  searchParams: Promise<{ month?: string }>
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { token } = await params
  const { month: monthParam } = await searchParams

  const expectedToken = process.env.FINANCE_TOKEN
  if (!expectedToken || token !== expectedToken) notFound()

  // Ensure current month exists
  await ensureCurrentMonth()

  const activeMonthKey = monthParam ?? currentMonthKey()

  const [dashboardData, cardsSummary, recurrings, months] = await Promise.all([
    getMonthDashboard(activeMonthKey),
    getCardsSummary(),
    getUpcomingRecurrings(),
    getMonths(),
  ])

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted text-sm">No data for this month.</p>
      </div>
    )
  }

  return (
    <Dashboard
      dashboardData={dashboardData}
      cardsSummary={cardsSummary}
      recurrings={recurrings}
      months={months}
      currentMonthKey={activeMonthKey}
    />
  )
}