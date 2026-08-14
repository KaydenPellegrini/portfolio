/**
 * Synthetic data for the RFID stocktake reconstruction.
 *
 * Every product name, serial number, location and count below is invented for
 * this portfolio. None of it comes from any employer system, and the scan
 * sequence is scripted so the demonstration always shows the same reconciliation
 * result: confirmed, missing, unexpected, and duplicates that are ignored.
 */

export type ExpectedItem = {
  serial: string
  product: string
  location: string
}

export type ScanEvent = {
  serial: string
  /** Product shown for a scan of something that is not on the expected list. */
  product?: string
}

export const stocktakeName = 'Stocktake DEMO-2026-03 / Demo Store'

export const expectedItems: ExpectedItem[] = [
  { serial: 'SN-DEMO-000481', product: 'Delivery catheter 6F', location: 'Bay A1' },
  { serial: 'SN-DEMO-000482', product: 'Delivery catheter 6F', location: 'Bay A1' },
  { serial: 'SN-DEMO-000517', product: 'Guide wire 0.035in', location: 'Bay A2' },
  { serial: 'SN-DEMO-000518', product: 'Guide wire 0.035in', location: 'Bay A2' },
  { serial: 'SN-DEMO-000603', product: 'Vascular sheath 7F', location: 'Bay A3' },
  { serial: 'SN-DEMO-000604', product: 'Vascular sheath 7F', location: 'Bay B1' },
  { serial: 'SN-DEMO-000711', product: 'Balloon catheter 3.0mm', location: 'Bay B1' },
  { serial: 'SN-DEMO-000712', product: 'Balloon catheter 3.0mm', location: 'Bay B2' },
  { serial: 'SN-DEMO-000806', product: 'Stent 3.0 x 18mm', location: 'Bay B2' },
  { serial: 'SN-DEMO-000807', product: 'Stent 3.0 x 18mm', location: 'Bay B3' },
  { serial: 'SN-DEMO-000901', product: 'Inflation device', location: 'Bay A3' },
  { serial: 'SN-DEMO-000902', product: 'Inflation device', location: 'Bay B3' },
]

/** The scripted scan stream. Two repeats and two off-list tags are included on purpose. */
export const scanStream: ScanEvent[] = [
  { serial: 'SN-DEMO-000481' },
  { serial: 'SN-DEMO-000517' },
  { serial: 'SN-DEMO-000603' },
  { serial: 'SN-DEMO-000481' },
  { serial: 'SN-DEMO-000711' },
  { serial: 'SN-DEMO-000806' },
  { serial: 'SN-DEMO-001204', product: 'Stent 3.5 x 12mm' },
  { serial: 'SN-DEMO-000807' },
  { serial: 'SN-DEMO-000518' },
  { serial: 'SN-DEMO-000712' },
  { serial: 'SN-DEMO-000517' },
  { serial: 'SN-DEMO-000604' },
  { serial: 'SN-DEMO-000901' },
  { serial: 'SN-DEMO-001330', product: 'Guide wire 0.014in' },
]

/** Shown above the panel so the result is clear without pressing anything. */
export const stocktakeSummary =
  '12 items are expected in this location and 14 tags are read. Ten are confirmed, two reads repeat a tag that was already counted and are ignored, two tags are not on the expected list, and two expected items are never read.'
