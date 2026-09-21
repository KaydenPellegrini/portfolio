/**
 * A small PDF writer for the CV.
 *
 * Text is always real text: every run is a text-showing operation in a
 * WinAnsi-encoded font with a ToUnicode map, so the output stays selectable,
 * searchable and readable by applicant tracking systems. Nothing is rasterised.
 *
 * Fonts are TrueType files read from the machine running the build, reduced
 * to the printable ASCII glyphs and embedded. The font file itself is never
 * copied into the repository. There is deliberately no built-in fallback face:
 * the brief fixes the typeface, so a CV set in anything else is not produced.
 *
 * Only what the CV needs is implemented: text runs, rules, bullet marks and
 * link annotations.
 */

import fs from 'node:fs'
import zlib from 'node:zlib'
import crypto from 'node:crypto'

export const A4 = { width: 595.28, height: 841.89 }

const FIRST_CHAR = 32
const LAST_CHAR = 126

// ---------------------------------------------------------- TrueType fonts --

function pad4(buf) {
  const extra = (4 - (buf.length % 4)) % 4
  return extra ? Buffer.concat([buf, Buffer.alloc(extra)]) : buf
}

function checksum(buf) {
  const padded = pad4(buf)
  let sum = 0
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0
  return sum
}

function readTableDirectory(buf) {
  const version = buf.readUInt32BE(0)
  if (version !== 0x00010000 && version !== 0x74727565) {
    throw new Error('not a TrueType outline font (CFF and collections are not supported)')
  }
  const tables = {}
  const count = buf.readUInt16BE(4)
  for (let i = 0; i < count; i += 1) {
    const record = 12 + i * 16
    tables[buf.toString('latin1', record, record + 4)] = {
      offset: buf.readUInt32BE(record + 8),
      length: buf.readUInt32BE(record + 12),
    }
  }
  for (const required of ['cmap', 'glyf', 'head', 'hhea', 'hmtx', 'loca', 'maxp', 'OS/2', 'post', 'name']) {
    if (!tables[required]) throw new Error(`missing required table ${required}`)
  }
  return tables
}

/** Character code to glyph id, from the Windows Unicode BMP (3,1) format 4 subtable. */
function readCmap(buf, table) {
  const base = table.offset
  const count = buf.readUInt16BE(base + 2)
  let subtable = -1
  for (let i = 0; i < count; i += 1) {
    const record = base + 4 + i * 8
    const offset = base + buf.readUInt32BE(record + 4)
    if (buf.readUInt16BE(record) === 3 && buf.readUInt16BE(record + 2) === 1 && buf.readUInt16BE(offset) === 4) {
      subtable = offset
      break
    }
  }
  if (subtable < 0) throw new Error('no Windows Unicode BMP cmap subtable')

  const segments = buf.readUInt16BE(subtable + 6) / 2
  const ends = subtable + 14
  const starts = ends + segments * 2 + 2
  const deltas = starts + segments * 2
  const rangeOffsets = deltas + segments * 2

  return (code) => {
    for (let s = 0; s < segments; s += 1) {
      if (code > buf.readUInt16BE(ends + s * 2)) continue
      const start = buf.readUInt16BE(starts + s * 2)
      if (code < start) return 0
      const delta = buf.readUInt16BE(deltas + s * 2)
      const rangeOffsetAt = rangeOffsets + s * 2
      const rangeOffset = buf.readUInt16BE(rangeOffsetAt)
      if (rangeOffset === 0) return (code + delta) & 0xffff
      const glyph = buf.readUInt16BE(rangeOffsetAt + rangeOffset + (code - start) * 2)
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff
    }
    return 0
  }
}

function readPostScriptName(buf, table) {
  const base = table.offset
  const count = buf.readUInt16BE(base + 2)
  const strings = base + buf.readUInt16BE(base + 4)
  for (let i = 0; i < count; i += 1) {
    const record = base + 6 + i * 12
    if (buf.readUInt16BE(record + 6) !== 6) continue
    const platform = buf.readUInt16BE(record)
    const raw = buf.subarray(strings + buf.readUInt16BE(record + 10), strings + buf.readUInt16BE(record + 10) + buf.readUInt16BE(record + 8))
    if (platform === 3) {
      let name = ''
      for (let j = 0; j + 1 < raw.length; j += 2) name += String.fromCharCode(raw.readUInt16BE(j))
      return name
    }
    if (platform === 1) return raw.toString('latin1')
  }
  return null
}

/** Glyph ids referenced by a composite glyph, so subsetting keeps its parts. */
function componentsOf(glyph) {
  if (glyph.length < 10 || glyph.readInt16BE(0) >= 0) return []
  const parts = []
  let p = 10
  for (;;) {
    const flags = glyph.readUInt16BE(p)
    parts.push(glyph.readUInt16BE(p + 2))
    p += 4 + (flags & 0x0001 ? 4 : 2)
    if (flags & 0x0008) p += 2
    else if (flags & 0x0040) p += 4
    else if (flags & 0x0080) p += 8
    if (!(flags & 0x0020)) break
  }
  return parts
}

/** A (3,1) format 4 cmap covering exactly the codes that are embedded. */
function buildCmap(pairs) {
  const segments = pairs.map(([code, glyph]) => ({ start: code, end: code, delta: (glyph - code) & 0xffff }))
  segments.push({ start: 0xffff, end: 0xffff, delta: 1 })
  const count = segments.length
  const searchRange = 2 * 2 ** Math.floor(Math.log2(count))
  const length = 16 + count * 8
  const sub = Buffer.alloc(length)
  sub.writeUInt16BE(4, 0)
  sub.writeUInt16BE(length, 2)
  sub.writeUInt16BE(count * 2, 6)
  sub.writeUInt16BE(searchRange, 8)
  sub.writeUInt16BE(Math.log2(searchRange / 2), 10)
  sub.writeUInt16BE(2 * count - searchRange, 12)
  let p = 14
  for (const s of segments) p = sub.writeUInt16BE(s.end, p)
  p += 2
  for (const s of segments) p = sub.writeUInt16BE(s.start, p)
  for (const s of segments) p = sub.writeUInt16BE(s.delta, p)

  const header = Buffer.alloc(12)
  header.writeUInt16BE(1, 2)
  header.writeUInt16BE(3, 4)
  header.writeUInt16BE(1, 6)
  header.writeUInt32BE(12, 8)
  return Buffer.concat([header, sub])
}

function assembleFont(tables) {
  const tags = Object.keys(tables).sort()
  const count = tags.length
  const searchRange = 16 * 2 ** Math.floor(Math.log2(count))
  const header = Buffer.alloc(12 + 16 * count)
  header.writeUInt32BE(0x00010000, 0)
  header.writeUInt16BE(count, 4)
  header.writeUInt16BE(searchRange, 6)
  header.writeUInt16BE(Math.floor(Math.log2(count)), 8)
  header.writeUInt16BE(count * 16 - searchRange, 10)

  let offset = header.length
  let headOffset = 0
  const bodies = tags.map((tag, i) => {
    const data = tables[tag]
    const record = 12 + i * 16
    header.write(tag, record, 4, 'latin1')
    header.writeUInt32BE(checksum(data), record + 4)
    header.writeUInt32BE(offset, record + 8)
    header.writeUInt32BE(data.length, record + 12)
    if (tag === 'head') headOffset = offset
    const padded = pad4(data)
    offset += padded.length
    return padded
  })

  const font = Buffer.concat([header, ...bodies])
  font.writeUInt32BE((0xb1b0afba - checksum(font)) >>> 0, headOffset + 8)
  return font
}

/**
 * Load a TrueType font and reduce it to the printable ASCII glyphs.
 * Refuses fonts whose licence bits do not allow embedding.
 */
export function loadTrueTypeFont(path) {
  const buf = fs.readFileSync(path)
  const tables = readTableDirectory(buf)
  const table = (tag) => buf.subarray(tables[tag].offset, tables[tag].offset + tables[tag].length)

  const os2 = table('OS/2')
  const fsType = os2.readUInt16BE(8)
  if (fsType & 0x0002 && !(fsType & 0x000c)) throw new Error('licence does not permit embedding')
  if (fsType & 0x0100) throw new Error('licence does not permit subsetting')

  const head = table('head')
  const unitsPerEm = head.readUInt16BE(18)
  const scale = 1000 / unitsPerEm
  const numGlyphs = table('maxp').readUInt16BE(4)
  const hhea = table('hhea')
  const numHMetrics = hhea.readUInt16BE(34)
  const hmtx = table('hmtx')
  const advance = (glyph) => hmtx.readUInt16BE(Math.min(glyph, numHMetrics - 1) * 4)

  const longLoca = head.readInt16BE(50) === 1
  const loca = table('loca')
  const glyfTable = table('glyf')
  const locaAt = (i) => (longLoca ? loca.readUInt32BE(i * 4) : loca.readUInt16BE(i * 2) * 2)
  const glyphData = (glyph) => glyfTable.subarray(locaAt(glyph), locaAt(glyph + 1))

  const glyphFor = readCmap(buf, tables.cmap)
  const pairs = []
  const widths = []
  for (let code = FIRST_CHAR; code <= LAST_CHAR; code += 1) {
    const glyph = glyphFor(code)
    if (glyph === 0) throw new Error(`no glyph for character ${JSON.stringify(String.fromCharCode(code))}`)
    pairs.push([code, glyph])
    widths.push(Math.round(advance(glyph) * scale))
  }

  // Keep .notdef, the ASCII glyphs, and anything they are built from.
  const keep = new Set([0, ...pairs.map(([, glyph]) => glyph)])
  const queue = [...keep]
  while (queue.length) {
    for (const part of componentsOf(glyphData(queue.pop()))) {
      if (!keep.has(part)) {
        keep.add(part)
        queue.push(part)
      }
    }
  }

  const pieces = []
  const newLoca = Buffer.alloc((numGlyphs + 1) * 4)
  let glyfLength = 0
  for (let glyph = 0; glyph < numGlyphs; glyph += 1) {
    newLoca.writeUInt32BE(glyfLength, glyph * 4)
    if (keep.has(glyph)) {
      const data = pad4(glyphData(glyph))
      pieces.push(data)
      glyfLength += data.length
    }
  }
  newLoca.writeUInt32BE(glyfLength, numGlyphs * 4)

  const newHead = Buffer.from(head)
  newHead.writeUInt32BE(0, 8) // checkSumAdjustment, recomputed on assembly
  newHead.writeInt16BE(1, 50) // long loca offsets

  const newPost = Buffer.from(table('post').subarray(0, 32))
  newPost.writeUInt32BE(0x00030000, 0) // version 3: no glyph names needed

  const subsetTables = {
    cmap: buildCmap(pairs),
    glyf: Buffer.concat(pieces),
    head: newHead,
    hhea: Buffer.from(hhea),
    hmtx: Buffer.from(hmtx),
    loca: newLoca,
    maxp: Buffer.from(table('maxp')),
    post: newPost,
    'OS/2': Buffer.from(os2),
  }
  // Hinting programs, kept because glyph instructions call into them.
  for (const tag of ['cvt ', 'fpgm', 'prep']) {
    if (tables[tag]) subsetTables[tag] = Buffer.from(table(tag))
  }

  const postscriptName = (readPostScriptName(buf, tables.name) || 'EmbeddedFont').replace(/[^A-Za-z0-9-]/g, '')
  const capHeight = os2.readUInt16BE(0) >= 2 && os2.length >= 90 ? os2.readInt16BE(88) : hhea.readInt16BE(4)
  const weight = os2.readUInt16BE(4)
  const italicAngle = table('post').readInt16BE(4) + table('post').readUInt16BE(6) / 65536

  return {
    kind: 'truetype',
    name: postscriptName,
    widths,
    data: assembleFont(subsetTables),
    descriptor: {
      bbox: [head.readInt16BE(36), head.readInt16BE(38), head.readInt16BE(40), head.readInt16BE(42)].map((v) => Math.round(v * scale)),
      ascent: Math.round(hhea.readInt16BE(4) * scale),
      descent: Math.round(hhea.readInt16BE(6) * scale),
      capHeight: Math.round(capHeight * scale),
      italicAngle,
      stemV: Math.round(50 + (weight / 65) ** 2),
    },
  }
}

// ------------------------------------------------------------- measurement --

/** Replace the punctuation a word processor tends to introduce, then drop anything else. */
export function toAscii(value) {
  const text = String(value)
  // Dashes are banned from the CV copy outright, so say so rather than quietly
  // substituting something.
  if (/[\u2013\u2014]/.test(text)) console.warn(`  ! en or em dash in CV copy: ${text.slice(0, 60)}`)
  const replaced = text
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
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
  for (const char of text) total += font.widths[char.charCodeAt(0) - FIRST_CHAR] ?? 500
  return (total / 1000) * size
}

function escapeText(text) {
  return text.replace(/[\\()]/g, (match) => `\\${match}`)
}

const n = (value) => (Number.isInteger(value) ? String(value) : value.toFixed(2))

// -------------------------------------------------------------------- pages --

class Page {
  constructor(doc) {
    this.doc = doc
    this.ops = []
    this.links = []
  }

  /**
   * Draw a sequence of runs as ONE text object. Each run can change font, size
   * and colour, and the text position simply advances, so an extractor sees one
   * continuous line rather than separate fragments. This is what keeps a bold
   * lead phrase, or a small caps heading, readable as a single piece of text.
   */
  textRuns(runs, x, y) {
    const ops = ['BT', `1 0 0 1 ${n(x)} ${n(y)} Tm`]
    let colour = ''
    let fontKey = ''
    for (const run of runs) {
      if (!run.text) continue
      const nextColour = run.colour.map((c) => n(c)).join(' ')
      if (nextColour !== colour) {
        ops.push(`${nextColour} rg`)
        colour = nextColour
      }
      const resource = this.doc.resourceFor(run.font)
      const nextFont = `/${resource} ${n(run.size)} Tf`
      if (nextFont !== fontKey) {
        ops.push(nextFont)
        fontKey = nextFont
      }
      ops.push(`(${escapeText(run.text)}) Tj`)
    }
    ops.push('ET')
    this.ops.push(...ops)
  }

  rule(x1, y, x2, colour, width) {
    this.ops.push(`${colour.map(n).join(' ')} RG`, `${n(width)} w`, `${n(x1)} ${n(y)} m ${n(x2)} ${n(y)} l S`)
  }

  dot(cx, cy, r, colour) {
    const k = 0.5523 * r
    const p = (a, b) => `${n(a)} ${n(b)}`
    this.ops.push(
      `${colour.map(n).join(' ')} rg`,
      `${p(cx - r, cy)} m`,
      `${p(cx - r, cy + k)} ${p(cx - k, cy + r)} ${p(cx, cy + r)} c`,
      `${p(cx + k, cy + r)} ${p(cx + r, cy + k)} ${p(cx + r, cy)} c`,
      `${p(cx + r, cy - k)} ${p(cx + k, cy - r)} ${p(cx, cy - r)} c`,
      `${p(cx - k, cy - r)} ${p(cx - r, cy - k)} ${p(cx - r, cy)} c`,
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

// ----------------------------------------------------------------- document --

export class PdfDocument {
  constructor(meta = {}) {
    this.meta = meta
    this.pages = []
    this.fonts = []
  }

  addPage() {
    const page = new Page(this)
    this.pages.push(page)
    return page
  }

  resourceFor(font) {
    let index = this.fonts.indexOf(font)
    if (index < 0) index = this.fonts.push(font) - 1
    return `F${index + 1}`
  }

  build() {
    const objects = []
    const add = (body) => objects.push(body) // returns 1-based object number
    const stream = (dict, data) => {
      const compressed = zlib.deflateSync(Buffer.isBuffer(data) ? data : Buffer.from(data, 'latin1'), { level: 9 })
      return { dict: `${dict} /Filter /FlateDecode /Length ${compressed.length}`, data: compressed }
    }

    add('') // 1 catalog
    add('') // 2 pages tree

    const toUnicode = add(
      stream(
        '<<',
        [
          '/CIDInit /ProcSet findresource begin',
          '12 dict begin',
          'begincmap',
          '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
          '/CMapName /Adobe-Identity-UCS def',
          '/CMapType 2 def',
          '1 begincodespacerange <00> <FF> endcodespacerange',
          '1 beginbfrange <20> <7E> <0020> endbfrange',
          'endcmap',
          'CMapName currentdict /CIDFont defineresource pop',
          'end',
          'end',
        ].join('\n'),
      ),
    )

    const fontObjects = this.fonts.map((font) => {
      // Subset fonts carry a six letter tag. Derived from the embedded bytes so
      // the output is deterministic from one build to the next.
      const tag = [...crypto.createHash('sha1').update(font.data).digest()]
        .slice(0, 6)
        .map((byte) => String.fromCharCode(65 + (byte % 26)))
        .join('')
      const fontName = `${tag}+${font.name}`
      const file = add(stream(`<< /Length1 ${font.data.length}`, font.data))
      const d = font.descriptor
      const descriptor = add(
        `<< /Type /FontDescriptor /FontName /${fontName} /Flags 32 /FontBBox [${d.bbox.join(' ')}] ` +
          `/ItalicAngle ${n(d.italicAngle)} /Ascent ${d.ascent} /Descent ${d.descent} /CapHeight ${d.capHeight} ` +
          `/StemV ${d.stemV} /FontFile2 ${file} 0 R >>`,
      )
      return add(
        `<< /Type /Font /Subtype /TrueType /BaseFont /${fontName} /FirstChar ${FIRST_CHAR} /LastChar ${LAST_CHAR} ` +
          `/Widths [${font.widths.join(' ')}] /Encoding /WinAnsiEncoding /FontDescriptor ${descriptor} 0 R ` +
          `/ToUnicode ${toUnicode} 0 R >>`,
      )
    })

    const fontResources = fontObjects.map((id, i) => `/F${i + 1} ${id} 0 R`).join(' ')
    const pageIds = this.pages.map((page) => {
      const contents = add(stream('<<', page.content))
      const annots = page.links.map((link) =>
        add(
          `<< /Type /Annot /Subtype /Link /Border [0 0 0] /Rect [${link.rect.map(n).join(' ')}] ` +
            `/A << /Type /Action /S /URI /URI (${escapeText(link.uri)}) >> >>`,
        ),
      )
      return add(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.width} ${A4.height}] ` +
          `/Resources << /Font << ${fontResources} >> >>` +
          (annots.length ? ` /Annots [${annots.map((id) => `${id} 0 R`).join(' ')}]` : '') +
          ` /Contents ${contents} 0 R >>`,
      )
    })

    const info = add(
      `<< /Title (${escapeText(this.meta.title ?? '')}) /Author (${escapeText(this.meta.author ?? '')}) ` +
        `/Subject (${escapeText(this.meta.subject ?? '')}) /Keywords (${escapeText(this.meta.keywords ?? '')}) ` +
        `/Creator (kayden.co.za) /Producer (kayden.co.za) >>`,
    )

    objects[0] = '<< /Type /Catalog /Pages 2 0 R /Lang (en-ZA) >>'
    objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

    const chunks = [Buffer.from('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n', 'latin1')]
    let length = chunks[0].length
    const offsets = []
    objects.forEach((body, i) => {
      offsets.push(length)
      const parts =
        typeof body === 'string'
          ? [Buffer.from(`${i + 1} 0 obj\n${body}\nendobj\n`, 'latin1')]
          : [
              Buffer.from(`${i + 1} 0 obj\n${body.dict} >>\nstream\n`, 'latin1'),
              body.data,
              Buffer.from('\nendstream\nendobj\n', 'latin1'),
            ]
      for (const part of parts) {
        chunks.push(part)
        length += part.length
      }
    })

    const xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`]
    for (const offset of offsets) xref.push(`${String(offset).padStart(10, '0')} 00000 n \n`)
    xref.push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${length}\n%%EOF\n`)
    chunks.push(Buffer.from(xref.join(''), 'latin1'))
    return Buffer.concat(chunks)
  }
}
