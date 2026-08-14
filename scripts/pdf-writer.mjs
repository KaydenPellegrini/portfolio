/**
 * A very small PDF writer.
 *
 * It emits real text objects using the base-14 Helvetica fonts, so the output
 * stays selectable, searchable and readable by applicant tracking systems.
 * Nothing is rasterised and no external library is needed.
 *
 * Only what the CV needs is implemented: text runs, wrapped paragraphs, rules,
 * bullet marks and link annotations.
 */

const A4 = { width: 595.28, height: 841.89 }

// Adobe base-14 glyph widths (1/1000 em) for the printable ASCII range 32-126.
// Anything outside that range is normalised away before it reaches the writer.
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556,
  556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778,
  722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278,
  278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]

const HELVETICA_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556,
  556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778,
  722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333,
  278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
]

export const FONTS = {
  regular: { resource: 'F1', base: 'Helvetica', widths: HELVETICA },
  bold: { resource: 'F2', base: 'Helvetica-Bold', widths: HELVETICA_BOLD },
}

/** Replace the punctuation a word processor tends to introduce, then drop anything else. */
export function toAscii(value) {
  const replaced = String(value)
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[·•]/g, '-')
    .replace(/…/g, '...')
    .replace(/ /g, ' ')
  const clean = replaced.replace(/[^\x20-\x7E]/g, '')
  if (clean !== replaced) {
    console.warn(`  ! dropped unsupported characters from: ${replaced.slice(0, 60)}`)
  }
  return clean
}

export function measure(text, font, size) {
  let total = 0
  for (const char of text) {
    const code = char.charCodeAt(0)
    total += font.widths[code - 32] ?? 500
  }
  return (total / 1000) * size
}

export function wrap(text, font, size, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (measure(candidate, font, size) <= maxWidth || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function escapeText(text) {
  return text.replace(/[\\()]/g, (match) => `\\${match}`)
}

/** One page of drawing operations plus any link annotations it carries. */
class Page {
  constructor() {
    this.ops = []
    this.links = []
  }

  text(value, x, y, font, size, colour = [0.11, 0.11, 0.14]) {
    this.ops.push(
      `${colour.join(' ')} rg`,
      'BT',
      `/${font.resource} ${size} Tf`,
      `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`,
      `(${escapeText(value)}) Tj`,
      'ET',
    )
  }

  rule(x1, y, x2, colour = [0.78, 0.78, 0.82], width = 0.8) {
    this.ops.push(
      `${colour.join(' ')} RG`,
      `${width} w`,
      `${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`,
    )
  }

  dot(cx, cy, r, colour = [0.11, 0.11, 0.14]) {
    const k = 0.5523 * r
    this.ops.push(
      `${colour.join(' ')} rg`,
      `${(cx - r).toFixed(2)} ${cy.toFixed(2)} m`,
      `${(cx - r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c`,
      `${(cx + k).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c`,
      `${(cx + r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c`,
      `${(cx - k).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c`,
      'f',
    )
  }

  link(uri, x, y, width, height) {
    this.links.push({ uri, rect: [x, y, x + width, y + height] })
  }

  get content() {
    return this.ops.join('\n')
  }
}

export class PdfDocument {
  constructor(meta = {}) {
    this.meta = meta
    this.pages = []
    this.size = A4
  }

  addPage() {
    const page = new Page()
    this.pages.push(page)
    return page
  }

  /** Serialise to a Buffer. Objects are written in order with a real xref table. */
  build() {
    const objects = []
    const add = (body) => {
      objects.push(body)
      return objects.length // 1-based object number
    }

    // Reserve 1 = catalog, 2 = pages tree.
    add('')
    add('')

    const fontIds = {
      [FONTS.regular.resource]: add(
        `<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS.regular.base} /Encoding /WinAnsiEncoding >>`,
      ),
      [FONTS.bold.resource]: add(
        `<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS.bold.base} /Encoding /WinAnsiEncoding >>`,
      ),
    }

    const pageIds = []
    for (const page of this.pages) {
      const streamId = add(`<< /Length ${Buffer.byteLength(page.content, 'latin1')} >>\nstream\n${page.content}\nendstream`)
      const annotIds = page.links.map((link) =>
        add(
          `<< /Type /Annot /Subtype /Link /Border [0 0 0] /Rect [${link.rect
            .map((n) => n.toFixed(2))
            .join(' ')}] /A << /Type /Action /S /URI /URI (${escapeText(link.uri)}) >> >>`,
        ),
      )
      const pageId = add(
        [
          '<< /Type /Page /Parent 2 0 R',
          `/MediaBox [0 0 ${this.size.width} ${this.size.height}]`,
          `/Resources << /Font << ${Object.entries(fontIds)
            .map(([resource, id]) => `/${resource} ${id} 0 R`)
            .join(' ')} >> >>`,
          annotIds.length ? `/Annots [${annotIds.map((id) => `${id} 0 R`).join(' ')}]` : '',
          `/Contents ${streamId} 0 R >>`,
        ]
          .filter(Boolean)
          .join('\n'),
      )
      pageIds.push(pageId)
    }

    const infoId = add(
      `<< /Title (${escapeText(this.meta.title ?? '')}) /Author (${escapeText(
        this.meta.author ?? '',
      )}) /Subject (${escapeText(this.meta.subject ?? '')}) /Keywords (${escapeText(
        this.meta.keywords ?? '',
      )}) /Creator (kayden.co.za) /Producer (kayden.co.za) >>`,
    )

    objects[0] = '<< /Type /Catalog /Pages 2 0 R /Lang (en-ZA) >>'
    objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

    let pdf = '%PDF-1.7\n%\xE2\xE3\xCF\xD3\n'
    const offsets = []
    for (let i = 0; i < objects.length; i += 1) {
      offsets.push(pdf.length)
      pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
    }

    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (const offset of offsets) {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
    }
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`

    return Buffer.from(pdf, 'latin1')
  }
}

export { A4 }
