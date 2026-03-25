import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { getTaxPageData } from '@/actions/tax'
import { getSettings } from '@/actions/settings'

function zarStr(cents: number) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100)
}

function dateStr(d: Date | string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token !== process.env.FINANCE_TOKEN) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  await connectDB()
  const settings = await getSettings()
  const taxYear = request.nextUrl.searchParams.get('year') ?? settings?.currentTaxYear ?? '2025/26'
  const data = await getTaxPageData(taxYear)
  if (!data) return new NextResponse('No data', { status: 404 })

  const {
    grossIncomeCents, totalDeductionsCents, estimatedTaxableIncomeCents,
    taxCalc, annualisedTaxableIncomeCents, annualisedTaxCalc,
    taxReserveAccumulatedCents, taxReservePct, deductibleExpenses,
    receiptOverrideCount,
  } = data

  const overUnder = taxReserveAccumulatedCents - taxCalc.netTax
  const isOver = overUnder >= 0

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IRP6 Tax Summary — ${taxYear}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #1a1a1a; background: #fff; padding: 32px; max-width: 820px; margin: 0 auto; }
  h1 { font-size: 20pt; color: #0A2342; border-bottom: 3px solid #00D4AA; padding-bottom: 8px; margin-bottom: 4px; }
  h2 { font-size: 13pt; color: #0A2342; margin: 24px 0 10px; border-left: 4px solid #00D4AA; padding-left: 10px; }
  .meta { color: #666; font-size: 9pt; margin-bottom: 28px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .box { background: #f5f7fa; border: 1px solid #e0e4ea; border-radius: 8px; padding: 14px; }
  .box-label { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .box-value { font-size: 16pt; font-weight: bold; font-family: monospace; color: #0A2342; }
  .box-value.danger { color: #C53030; }
  .box-value.accent { color: #00A882; }
  .box-value.gold { color: #B7791F; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th { background: #0A2342; color: #fff; text-align: left; padding: 8px 10px; font-size: 9pt; }
  td { padding: 7px 10px; font-size: 9pt; border-bottom: 1px solid #e8ecf0; }
  tr:nth-child(even) td { background: #f8fafc; }
  .line { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 10.5pt; }
  .line.bold { font-weight: bold; border-bottom: 2px solid #ccc; }
  .line.total { font-weight: bold; font-size: 12pt; border-bottom: 2px solid #0A2342; }
  .efiling-box { background: #EBF8F5; border: 2px solid #00D4AA; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .efiling-box h3 { color: #00695C; font-size: 11pt; margin-bottom: 10px; }
  .efiling-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 10.5pt; }
  .efiling-row .val { font-family: monospace; font-weight: bold; color: #0A2342; }
  .warn { background: #FFF5E5; border: 1px solid #F6AD55; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 9.5pt; color: #7B341E; }
  .ok { background: #EBF8F5; border: 1px solid #00D4AA; border-radius: 6px; padding: 10px 14px; margin: 12px 0; font-size: 9.5pt; color: #00695C; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>

<h1>Provisional Tax Summary</h1>
<p class="meta">Tax Year ${taxYear} &nbsp;·&nbsp; Generated ${dateStr(new Date())} &nbsp;·&nbsp; CONFIDENTIAL</p>

<h2>Income & Deductions</h2>
<div>
  <div class="line"><span>Gross Billing Income (YTD)</span><span>${zarStr(grossIncomeCents)}</span></div>
  <div class="line"><span>Less: Total Deductible Expenses</span><span>(${zarStr(totalDeductionsCents)})</span></div>
  <div class="line bold"><span>Estimated Taxable Income</span><span>${zarStr(estimatedTaxableIncomeCents)}</span></div>
</div>

<h2>Tax Calculation (2025/26 Brackets)</h2>
<div>
  <div class="line"><span>Gross Tax</span><span>${zarStr(taxCalc.grossTax)}</span></div>
  <div class="line"><span>Less: Primary Rebate</span><span>(${zarStr(taxCalc.rebateAmount)})</span></div>
  <div class="line total"><span>Net Tax Payable</span><span>${zarStr(taxCalc.netTax)}</span></div>
  <div class="line"><span>Effective Tax Rate</span><span>${taxCalc.effectiveRate}%</span></div>
  <div class="line"><span>Marginal Tax Rate</span><span>${taxCalc.marginalRate}%</span></div>
</div>

<h2>Annualised Projection</h2>
<div>
  <div class="line"><span>Annualised Taxable Income</span><span>${zarStr(annualisedTaxableIncomeCents)}</span></div>
  <div class="line bold"><span>Annualised Tax Estimate</span><span>${zarStr(annualisedTaxCalc.netTax)}</span></div>
</div>

<h2>Tax Reserve Health</h2>
<div class="grid2">
  <div class="box"><div class="box-label">Reserve Accumulated (${taxReservePct}%)</div><div class="box-value gold">${zarStr(taxReserveAccumulatedCents)}</div></div>
  <div class="box"><div class="box-label">Estimated Tax Liability</div><div class="box-value danger">${zarStr(taxCalc.netTax)}</div></div>
</div>
${isOver
  ? `<div class="ok">✓ Over-reserving by ${zarStr(overUnder)} — reserve exceeds current liability.</div>`
  : `<div class="warn">⚠ Under-reserving by ${zarStr(Math.abs(overUnder))} — consider increasing your ${taxReservePct}% reserve rate.</div>`}

<div class="efiling-box">
  <h3>📋 Ready-to-Copy eFiling Figures</h3>
  <div class="efiling-row"><span>Gross Income (4101)</span><span class="val">${zarStr(grossIncomeCents)}</span></div>
  <div class="efiling-row"><span>Allowable Deductions</span><span class="val">${zarStr(totalDeductionsCents)}</span></div>
  <div class="efiling-row"><span>Taxable Income</span><span class="val">${zarStr(estimatedTaxableIncomeCents)}</span></div>
  <div class="efiling-row"><span>Estimated Tax</span><span class="val">${zarStr(taxCalc.netTax)}</span></div>
</div>

${receiptOverrideCount > 0
  ? `<div class="warn">⚠ ${receiptOverrideCount} deductible expense${receiptOverrideCount > 1 ? 's are' : ' is'} missing receipts (override recorded). These may be challenged in a SARS audit. Obtain supporting documentation where possible.</div>`
  : ''}

<h2>Deductible Expenses (${deductibleExpenses.length} entries)</h2>
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Vendor</th>
      <th>Category</th>
      <th>Description</th>
      <th style="text-align:right">Amount</th>
      <th>Receipt</th>
    </tr>
  </thead>
  <tbody>
    ${deductibleExpenses.map((e: any) => `
    <tr>
      <td>${dateStr(e.date)}</td>
      <td>${e.vendor ?? '—'}</td>
      <td>${e.categoryLabel}</td>
      <td>${e.description}</td>
      <td style="text-align:right;font-family:monospace">${zarStr(e.amountCents)}</td>
      <td>${e.receiptUrl ? '✓' : e.receiptOverrideReason ? '⚠ Override' : '—'}</td>
    </tr>`).join('')}
    <tr>
      <td colspan="4" style="font-weight:bold;text-align:right">TOTAL</td>
      <td style="text-align:right;font-family:monospace;font-weight:bold">${zarStr(totalDeductionsCents)}</td>
      <td></td>
    </tr>
  </tbody>
</table>

<p style="margin-top:32px;font-size:8pt;color:#999;border-top:1px solid #eee;padding-top:12px">
  This report is generated by Finance OS for personal tax planning purposes only. 
  It is not professional tax advice. Consult a registered SARS tax practitioner before filing your IRP6.
  All amounts in South African Rand (ZAR). Tax brackets: SARS 2025/26.
</p>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="IRP6-${taxYear.replace('/', '_')}-summary.html"`,
    },
  })
}
