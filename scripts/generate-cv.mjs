/**
 * Builds public/Kayden-Pellegrini-CV-2026.pdf from src/data/cv/profile.ts.
 *
 *   npm run cv
 *
 * profile.ts is the editable source. This script only decides how it looks.
 *
 * Typeface: the brief fixes it as Calibri or a similar humanist sans, so there
 * is no fallback to anything else. Calibri is read from the Windows fonts folder
 * at build time and embedded as a subset; the font file is never copied into the
 * repository. On a machine without Calibri, point the build at a metric
 * compatible humanist sans such as Carlito and the line breaks stay the same:
 *
 *   CV_FONT_REGULAR=/path/Carlito-Regular.ttf CV_FONT_BOLD=/path/Carlito-Bold.ttf npm run cv
 *
 * ATS notes, because they drive several choices below:
 *   - Single column, no tables, no text boxes, no images. Contact details are in
 *     the body, not in a page header.
 *   - Every line is real text with a ToUnicode map. A bold lead phrase and the
 *     rest of its bullet are drawn in one text object, so extractors read them as
 *     one sentence rather than two fragments.
 *   - Every drawn line ends in a space, so an extractor that concatenates lines
 *     does not glue the last word of one line to the first word of the next.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import { A4, PdfDocument, loadTrueTypeFont, measure, toAscii } from './pdf-writer.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function loadDataModule(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  const tempFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cv-data-')), 'profile.mjs')
  fs.writeFileSync(tempFile, outputText)
  try {
    return await import(pathToFileURL(tempFile).href)
  } finally {
    fs.rmSync(path.dirname(tempFile), { recursive: true, force: true })
  }
}

const profile = await loadDataModule('src/data/cv/profile.ts')

function loadFonts() {
  const windowsFonts = path.join(process.env.WINDIR ?? 'C:\\Windows', 'Fonts')
  const regularPath = process.env.CV_FONT_REGULAR ?? path.join(windowsFonts, 'calibri.ttf')
  const boldPath = process.env.CV_FONT_BOLD ?? path.join(windowsFonts, 'calibrib.ttf')
  try {
    const regular = loadTrueTypeFont(regularPath)
    const bold = loadTrueTypeFont(boldPath)
    return { regular, bold, label: `${regular.name} and ${bold.name}, embedded subsets` }
  } catch (error) {
    console.error(`Cannot build the CV: ${error.message}`)
    console.error('The brief sets it in Calibri or a similar humanist sans, and nothing else is substituted.')
    console.error('Set CV_FONT_REGULAR and CV_FONT_BOLD to the regular and bold font files.')
    process.exit(1)
  }
}

const fonts = loadFonts()

// ------------------------------------------------------------------ layout ---

const INCH = 72
const MARGIN_X = 0.7 * INCH
const MARGIN_TOP = 0.55 * INCH
const MARGIN_BOTTOM = 0.55 * INCH
const WIDTH = A4.width - MARGIN_X * 2

const NAVY = [31 / 255, 58 / 255, 95 / 255]
const INK = [0.13, 0.13, 0.15]
const GREY = [0.42, 0.43, 0.47]
const RULE = [0.74, 0.78, 0.84]

const BODY = 9.5
const LEADING = 12.4
const HEADING = 10.5
const BULLET_INDENT = 11

const doc = new PdfDocument({
  title: `${profile.identity.name} CV`,
  author: profile.identity.name,
  subject: profile.identity.title,
  keywords: 'Data Engineer, Power Platform, Dataverse, Power BI, SQL, Python, dbt, Model Context Protocol, RFID',
})

let page = doc.addPage()
let y = A4.height - MARGIN_TOP

function ensure(height) {
  if (y - height < MARGIN_BOTTOM) {
    page = doc.addPage()
    y = A4.height - MARGIN_TOP
  }
}

const regular = (text, size = BODY, colour = INK, uri) => ({ text, font: fonts.regular, size, colour, uri })
const bold = (text, size = BODY, colour = INK) => ({ text, font: fonts.bold, size, colour })

// ------------------------------------------------------------ rich wrapping ---

/**
 * Split styled runs into words. A word can span runs with no space between
 * them, which is what keeps "Dataverse" (bold) and "," (regular) together.
 */
function toWords(runs) {
  const words = []
  let current = null
  let space = false
  for (const run of runs) {
    for (const part of toAscii(run.text).split(/( +)/)) {
      if (!part) continue
      if (part.trim() === '') {
        if (current) words.push(current)
        current = null
        space = true
        continue
      }
      if (!current) {
        current = { pieces: [], spaceBefore: space && words.length > 0 }
        space = false
      }
      current.pieces.push({ ...run, text: part })
    }
  }
  if (current) words.push(current)
  return words
}

const pieceWidth = (piece) => measure(piece.text, piece.font, piece.size)
const wordWidth = (word) => word.pieces.reduce((sum, piece) => sum + pieceWidth(piece), 0)
const spaceWidth = (word) => measure(' ', word.pieces[0].font, word.pieces[0].size)

function wrap(runs, firstWidth, restWidth = firstWidth) {
  const lines = []
  let line = []
  let width = 0
  for (const word of toWords(runs)) {
    const max = lines.length === 0 ? firstWidth : restWidth
    const gap = line.length && word.spaceBefore ? spaceWidth(word) : 0
    const w = wordWidth(word)
    if (line.length && width + gap + w > max) {
      lines.push(line)
      line = [word]
      width = w
    } else {
      line.push(word)
      width += gap + w
    }
  }
  if (line.length) lines.push(line)
  return lines
}

function drawLine(line, x, baseline) {
  const runs = []
  const links = []
  let cursor = x
  const push = (piece) => {
    const last = runs[runs.length - 1]
    if (last && last.font === piece.font && last.size === piece.size && last.colour === piece.colour) {
      last.text += piece.text
    } else {
      runs.push({ text: piece.text, font: piece.font, size: piece.size, colour: piece.colour })
    }
  }
  line.forEach((word, i) => {
    if (i > 0 && word.spaceBefore) {
      const first = word.pieces[0]
      push({ ...first, text: ' ' })
      cursor += measure(' ', first.font, first.size)
    }
    for (const piece of word.pieces) {
      const w = pieceWidth(piece)
      if (piece.uri) links.push({ uri: piece.uri, x: cursor, w, size: piece.size })
      push(piece)
      cursor += w
    }
  })
  runs[runs.length - 1].text += ' '
  page.textRuns(runs, x, baseline)
  for (const link of links) page.link(link.uri, link.x, baseline - link.size * 0.25, link.w, link.size * 1.1)
}

function paragraph(runs, { indent = 0, leading = LEADING, after = 0, keepTogether = true } = {}) {
  const size = Math.max(...runs.map((run) => run.size))
  const lines = wrap(runs, WIDTH, WIDTH - indent)
  if (keepTogether) ensure(lines.length * leading)
  lines.forEach((line, i) => {
    ensure(leading)
    drawLine(line, MARGIN_X + (i === 0 ? 0 : indent), y - size)
    y -= leading
  })
  y -= after
}

const bulletRuns = ({ lead = '', rest }) => [bold(lead), regular(rest)]

function bullet(item) {
  const lines = wrap(bulletRuns(item), WIDTH - BULLET_INDENT)
  ensure(lines.length * LEADING)
  lines.forEach((line, i) => {
    const baseline = y - BODY
    if (i === 0) page.dot(MARGIN_X + 3.2, baseline + BODY * 0.3, 1.5, NAVY)
    drawLine(line, MARGIN_X + BULLET_INDENT, baseline)
    y -= LEADING
  })
  y -= 1.6
}

/** Small caps: capitals at full size, lower case set as smaller capitals. */
function smallCaps(text, size, colour) {
  const runs = []
  for (const char of text) {
    const lower = char >= 'a' && char <= 'z'
    const runSize = lower ? Math.round(size * 0.78 * 100) / 100 : size
    const last = runs[runs.length - 1]
    if (last && last.size === runSize) last.text += char.toUpperCase()
    else runs.push(bold(char.toUpperCase(), runSize, colour))
  }
  return runs
}

/** Heading, rule, and enough room below it that it never ends a page alone. */
function sectionHeading(title, keepWith = 3 * LEADING) {
  ensure(12 + HEADING + 11 + keepWith)
  y -= 12
  const baseline = y - HEADING
  const runs = smallCaps(title, HEADING, NAVY)
  runs[runs.length - 1].text += ' '
  page.textRuns(runs, MARGIN_X, baseline)
  y = baseline - 4
  page.rule(MARGIN_X, y, A4.width - MARGIN_X, RULE, 0.6)
  y -= 7
}

// ------------------------------------------------------------------ header ---

{
  const nameSize = 20
  let baseline = y - nameSize * 0.8
  page.textRuns([bold(`${profile.identity.name} `, nameSize, NAVY)], MARGIN_X, baseline)
  y = baseline - 9

  baseline = y - 11
  page.textRuns([regular(`${profile.identity.title} `, 11, INK)], MARGIN_X, baseline)
  y = baseline - 13

  const bare = (url) => url.replace(/^https?:\/\//, '')
  const contactLine = (parts) => {
    const runs = []
    parts.forEach((part, i) => {
      if (i > 0) runs.push(regular('  |  ', 9, GREY))
      runs.push(regular(part.text, 9, part.uri ? NAVY : INK, part.uri))
    })
    paragraph(runs, { leading: 12.2, keepTogether: false })
  }

  contactLine([
    { text: profile.identity.location },
    { text: profile.contact.phone, uri: `tel:+27${profile.contact.phone.replace(/\s/g, '').replace(/^0/, '')}` },
    { text: profile.contact.email, uri: `mailto:${profile.contact.email}` },
  ])
  contactLine([
    { text: bare(profile.contact.linkedin), uri: profile.contact.linkedin },
    { text: bare(profile.contact.github), uri: profile.contact.github },
    { text: bare(profile.contact.website), uri: profile.contact.website },
  ])
  paragraph([regular(profile.workAuthorisation, 9, INK)], { leading: 12.2, keepTogether: false })
}

// ----------------------------------------------------------------- profile ---

sectionHeading('Profile')
profile.cvProfile.forEach((text, i, all) => paragraph([regular(text)], { after: i < all.length - 1 ? 4 : 0 }))

// -------------------------------------------------------------- key skills ---

sectionHeading('Key skills')
for (const line of profile.cvSkills) {
  paragraph([bold(`${line.label}: `), regular(line.items.join(', '))], { indent: 12, after: 1.2 })
}

// -------------------------------------------------------------- experience ---

sectionHeading('Experience', 2 * LEADING + wrap(bulletRuns(profile.experience[0].bullets[0]), WIDTH).length * LEADING)
profile.experience.forEach((role, index) => {
  const firstBullet = wrap(bulletRuns(role.bullets[0]), WIDTH - BULLET_INDENT).length * LEADING
  ensure((index > 0 ? 6 : 0) + 13.5 + 12.4 + 2 + firstBullet)
  if (index > 0) y -= 6
  paragraph([bold(role.role, 10.5)], { leading: 13.5, keepTogether: false })
  paragraph([regular(`${role.company}, ${role.location}  |  ${role.period}`, 9, GREY)], { leading: 12.4, keepTogether: false })
  y -= 2
  role.bullets.forEach(bullet)
})

// ----------------------------------------------------------- selected work ---

sectionHeading('Selected work')
for (const item of profile.cvSelectedWork) {
  const runs = [bold(`${item.title}.`), regular(` ${item.description}`)]
  if (item.url) runs.push(regular(` ${item.url.replace(/^https?:\/\//, '')}`, BODY, NAVY, item.url))
  paragraph(runs, { after: 3 })
}

// --------------------------------------------------------------- education ---

sectionHeading('Education')
profile.education.forEach((entry, index) => {
  if (index > 0) y -= 4
  ensure(3 * LEADING)
  paragraph([bold(entry.qualification, 10)], { leading: 13, keepTogether: false })
  paragraph([regular([entry.place, entry.period, ...entry.notes].join('  |  '), 9, GREY)], { leading: 12 })
  if (entry.subjects) {
    paragraph([regular(`Relevant study: ${entry.subjects.join(', ')}`, 8.5, GREY)], { leading: 11 })
  }
})

// --------------------------------------------------------------- languages ---

sectionHeading('Languages', LEADING)
paragraph([regular(profile.languages.join('  |  '))])

// ------------------------------------------------------------------- write ---

const output = path.join(root, 'public', profile.cvFileName)
fs.writeFileSync(output, doc.build())

const bytes = fs.statSync(output).size
console.log(
  `Wrote ${path.relative(root, output)}: ${doc.pages.length} pages, ${(bytes / 1024).toFixed(1)} kB, ${fonts.label}`,
)
console.log(`Space left at the foot of the last page: ${Math.round(y - MARGIN_BOTTOM)} pt`)
if (doc.pages.length > 2) {
  console.warn('! The CV is longer than two pages. Trim content in src/data/cv/profile.ts.')
}
