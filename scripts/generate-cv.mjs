/**
 * Builds public/Kayden-Pellegrini-CV-2026.pdf from the same content the website
 * renders, so the CV and the site cannot drift apart.
 *
 *   npm run cv
 *
 * Content comes from src/data/cv/profile.ts and src/data/showcase/projects.ts.
 * Both are plain data modules with no imports of their own, which is what lets
 * this script transpile them with the TypeScript compiler already in
 * devDependencies and import the result directly. If either file ever grows an
 * import, this loader needs to resolve it too.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import { A4, FONTS, PdfDocument, measure, toAscii, wrap } from './pdf-writer.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function loadDataModule(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  })
  const tempFile = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'cv-data-')),
    `${path.basename(relativePath, '.ts')}.mjs`,
  )
  fs.writeFileSync(tempFile, outputText)
  try {
    return await import(pathToFileURL(tempFile).href)
  } finally {
    fs.rmSync(path.dirname(tempFile), { recursive: true, force: true })
  }
}

const profile = await loadDataModule('src/data/cv/profile.ts')
const showcase = await loadDataModule('src/data/showcase/projects.ts')

// ---------------------------------------------------------------- layout ----

const MARGIN_X = 48
const MARGIN_TOP = 46
const MARGIN_BOTTOM = 44
const CONTENT_WIDTH = A4.width - MARGIN_X * 2

const INK = [0.11, 0.11, 0.14]
const MUTED = [0.36, 0.36, 0.42]
const ACCENT = [0.0, 0.42, 0.3]

const doc = new PdfDocument({
  title: `${profile.identity.name} CV`,
  author: profile.identity.name,
  subject: profile.identity.title,
  keywords:
    'data engineering, dbt, SQL, Python, Model Context Protocol, LLM tooling, Power Platform, Power BI, Dataverse, RFID',
})

let page = doc.addPage()
let y = A4.height - MARGIN_TOP

function newPage() {
  page = doc.addPage()
  y = A4.height - MARGIN_TOP
}

function ensureSpace(needed) {
  if (y - needed < MARGIN_BOTTOM) newPage()
}

/**
 * Every wrapped line is drawn as its own text-showing operation. A text
 * extractor that concatenates those operations without inserting whitespace
 * would join the last word of one line to the first word of the next
 * ("product checks," + "replenishment" -> "checks,replenishment"), which is
 * exactly what some applicant tracking systems do. A trailing space is
 * invisible when rendered and makes the concatenation come out correct.
 */
function drawn(text) {
  return `${text} `
}

/** Draw one line of text and move the cursor down. */
function line(text, { font = FONTS.regular, size = 9.6, leading = 13, colour = INK, x = MARGIN_X } = {}) {
  ensureSpace(leading)
  y -= size
  page.text(drawn(toAscii(text)), x, y, font, size, colour)
  y -= leading - size
}

/** Wrap and draw a paragraph. `indent` shifts continuation lines only. */
function paragraph(
  text,
  { font = FONTS.regular, size = 9.6, leading = 12.8, colour = INK, x = MARGIN_X, width = CONTENT_WIDTH, indent = 0, after = 0 } = {},
) {
  const clean = toAscii(text)
  const lines = wrap(clean, font, size, width)
  lines.forEach((content, index) => {
    const left = index === 0 ? x : x + indent
    ensureSpace(leading)
    y -= size
    page.text(drawn(content), left, y, font, size, colour)
    y -= leading - size
  })
  y -= after
}

/** Bold lead-in followed by wrapped body text on the same line. */
function labelledParagraph(label, body, { size = 9.6, leading = 12.8, gap = 4, after = 3 } = {}) {
  const labelText = toAscii(`${label}:`)
  const labelWidth = measure(labelText, FONTS.bold, size) + gap
  const firstWidth = CONTENT_WIDTH - labelWidth
  const words = toAscii(body).split(/\s+/).filter(Boolean)

  const firstLine = []
  while (words.length && measure([...firstLine, words[0]].join(' '), FONTS.regular, size) <= firstWidth) {
    firstLine.push(words.shift())
  }

  ensureSpace(leading)
  y -= size
  page.text(drawn(labelText), MARGIN_X, y, FONTS.bold, size, INK)
  if (firstLine.length) page.text(drawn(firstLine.join(' ')), MARGIN_X + labelWidth, y, FONTS.regular, size, INK)
  y -= leading - size

  if (words.length) {
    paragraph(words.join(' '), { size, leading, after })
  } else {
    y -= after
  }
}

function sectionHeading(title) {
  ensureSpace(38)
  y -= 14
  page.text(drawn(toAscii(title.toUpperCase())), MARGIN_X, y, FONTS.bold, 10.4, ACCENT)
  y -= 6
  page.rule(MARGIN_X, y, A4.width - MARGIN_X, [0.78, 0.82, 0.8], 0.9)
  y -= 11
}

function bullet(text, { size = 9.4, leading = 12.4 } = {}) {
  const indent = 13
  const clean = toAscii(text)
  const lines = wrap(clean, FONTS.regular, size, CONTENT_WIDTH - indent)
  lines.forEach((content, index) => {
    ensureSpace(leading)
    y -= size
    if (index === 0) page.dot(MARGIN_X + 3.2, y + size * 0.32, 1.6, ACCENT)
    page.text(drawn(content), MARGIN_X + indent, y, FONTS.regular, size, INK)
    y -= leading - size
  })
}

// ----------------------------------------------------------------- header ---

y -= 4
page.text(drawn(toAscii(profile.identity.name)), MARGIN_X, y - 21, FONTS.bold, 21, INK)
y -= 21 + 8
page.text(drawn(toAscii(profile.identity.title)), MARGIN_X, y - 10.6, FONTS.bold, 10.6, ACCENT)
y -= 10.6 + 10

const contactParts = [
  { text: profile.identity.location },
  { text: profile.contact.phone, uri: `tel:${profile.contact.phone.replace(/\s/g, '')}` },
  { text: profile.contact.email, uri: `mailto:${profile.contact.email}` },
  { text: profile.contact.linkedin.replace(/^https?:\/\//, ''), uri: profile.contact.linkedin },
  { text: profile.contact.github.replace(/^https?:\/\//, ''), uri: profile.contact.github },
  { text: profile.contact.website.replace(/^https?:\/\//, ''), uri: profile.contact.website },
]

const CONTACT_SIZE = 8.8
const SEPARATOR = '  |  '
let cursorX = MARGIN_X
y -= CONTACT_SIZE
for (const [index, part] of contactParts.entries()) {
  const text = toAscii(part.text)
  const width = measure(text, FONTS.regular, CONTACT_SIZE)
  if (cursorX + width > A4.width - MARGIN_X) {
    y -= 12
    cursorX = MARGIN_X
  } else if (index > 0) {
    page.text(SEPARATOR, cursorX, y, FONTS.regular, CONTACT_SIZE, MUTED)
    cursorX += measure(SEPARATOR, FONTS.regular, CONTACT_SIZE)
  }
  // Trailing space for the same reason as `drawn`: the contact row wraps
  // without drawing a separator, and the work authorisation line follows it.
  page.text(drawn(text), cursorX, y, FONTS.regular, CONTACT_SIZE, part.uri ? ACCENT : MUTED)
  // The link annotation covers the visible text only, not the trailing space.
  if (part.uri) page.link(part.uri, cursorX, y - 2, width, CONTACT_SIZE + 3)
  cursorX += width
}
y -= 13
page.text(drawn(toAscii(profile.workAuthorisation)), MARGIN_X, y, FONTS.regular, CONTACT_SIZE, INK)
y -= 10

// ---------------------------------------------------------------- summary ---

sectionHeading('Professional summary')
for (const block of profile.summary) {
  paragraph(block, { after: 5 })
}

// ----------------------------------------------------------------- skills ---

sectionHeading('Key skills')
for (const group of profile.skillGroups) {
  labelledParagraph(group.name, group.skills.join(', '))
}

// ------------------------------------------------------------- experience ---

sectionHeading('Experience')
for (const [index, role] of profile.experience.entries()) {
  ensureSpace(46)
  if (index > 0) y -= 7
  line(role.role, { font: FONTS.bold, size: 10.6, leading: 13.4 })
  line(`${role.company}, ${role.location}  |  ${role.period}`, {
    size: 9,
    leading: 13,
    colour: MUTED,
  })
  y -= 2
  // Bullets are ordered strongest first, so slicing drops the weakest.
  for (const item of role.bullets.slice(0, role.cvMaxBullets ?? role.bullets.length)) {
    bullet(item)
  }
}

// -------------------------------------------------------------- education ---

sectionHeading('Education')
for (const [index, entry] of profile.education.entries()) {
  ensureSpace(34)
  if (index > 0) y -= 6
  line(entry.qualification, { font: FONTS.bold, size: 10, leading: 13 })
  const meta = [entry.place, entry.period, ...entry.notes].join('  |  ')
  line(meta, { size: 9, leading: 12.6, colour: MUTED })
  if (entry.subjects) {
    y -= 1
    labelledParagraph('Relevant study', entry.subjects.join(', '), { size: 9.2, leading: 12.4, after: 0 })
  }
}

// --------------------------------------------------------------- projects ---

// Public repositories first: they are the work a reader can go and verify.
sectionHeading('Selected work')
for (const project of [...showcase.openSourceProjects, ...showcase.professionalProjects]) {
  const repo = project.links?.repo?.replace(/^https?:\/\//, '')
  const body = repo ? `${project.summary} Repository: ${repo}` : project.summary
  labelledParagraph(project.title, body, { size: 9.4, leading: 12.4, after: 4 })
}

// -------------------------------------------------------------- languages ---

sectionHeading('Languages')
paragraph(profile.languages.join('  |  '), { size: 9.4 })

// ------------------------------------------------------------------ write ---

const output = path.join(root, 'public', profile.cvFileName)
fs.writeFileSync(output, doc.build())

const bytes = fs.statSync(output).size
console.log(`Wrote ${path.relative(root, output)} (${doc.pages.length} pages, ${(bytes / 1024).toFixed(1)} kB)`)
if (doc.pages.length > 2) {
  console.warn('! The CV is longer than two pages. Trim content or reduce sizes in scripts/generate-cv.mjs.')
}
