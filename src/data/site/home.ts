/**
 * Home page narrative.
 *
 * This is deliberately not the CV. Facts such as dates and titles come from
 * src/data/cv/profile.ts, but the wording here is written for the site: shorter
 * where the CV is a list, and long form where the site can show how a problem
 * was worked through, which a two page PDF cannot.
 *
 * Confidentiality: employer work is described as a class of problem, a method
 * and a relative outcome. No real names, codes, figures, schema or screenshots.
 * Anything that needs data to demonstrate it points at a public repository or a
 * Build Lab reconstruction, both built on synthetic data.
 */

import type { Snippet } from '@/components/portfolio/CodeSnippet'
import { adjudicatorContract, creditNotesTest, fanoutTest } from './snippets'

export const heroChips = ['Data Engineering', 'Power Platform and BI', 'AI Systems', 'Integration and Hardware']

export const heroSummary =
  'I build the data layer and the AI layer that business operations run on. Pipelines and models that produce a number people can stand behind, and LLM tooling connected to the systems those numbers come from.'

/** Decorative capability labels. Nothing here is presented as a live status. */
export const capabilityChips = ['DBT_BUILD', 'MCP_LINKED', 'RFID_READ', 'QUERY_READY']

export const whatIDo =
  'I own the operational data layer at a medical device distributor, end to end: the Dataverse model, the Sage integration, the Power BI reporting and the Power Apps the warehouse runs on. Most of the hard work is getting a number to survive being checked, so cost is rebuilt per serialised unit and a figure that stops reconciling fails the build before it reaches a report. On top of that data I have shipped LLM tooling through Model Context Protocol, along with the rules for what it is allowed to claim.'

export type CaseLink = {
  label: string
  href: string
}

export type CaseStudy = {
  id: string
  kicker: string
  title: string
  /** One line on where the work happened and what the page can and cannot show. */
  context: string
  problem: string[]
  built: string[]
  changed: string[]
  evidence?: { snippet: Snippet; caption: string }
  links: CaseLink[]
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'serial-level-margin',
    kicker: 'Data engineering',
    title: 'Margin at the grain of the unit',
    context:
      'Built at Virtumed. The method is described here. The public version of the same technique runs on synthetic data.',
    problem: [
      'The business could not say what it actually made on a product. Margin was being worked out from list price and valuation figures, and neither of those is what anything cost.',
      'Stock bought abroad arrives on a purchase order in a foreign currency, shares the freight, customs and bank charges of the shipment it came in on, and is sold one numbered unit at a time. A list price captures none of that.',
    ],
    built: [
      'Landed cost rebuilt at the grain of the individual serialised unit. Each unit takes its cost from the supplier price at the exchange rate actually paid on that transaction, plus its share of the freight, customs and bank charges on its shipment.',
      'Every inventory record traces back to the purchase order line that paid for it, so any margin figure can be followed to its source. The logic runs through a mix of Dataverse and dbt models, with tests written to fail the build when a number stops reconciling. A figure that cannot be defended stops there instead of reaching a report.',
    ],
    changed: [
      'The business has its first defensible margin figure by product. Defensible is the point: every number can be traced back to the transactions that produced it.',
    ],
    evidence: {
      snippet: fanoutTest,
      caption:
        'A test from the public version. A join that fans out duplicates units and inflates every total built on it, so the build fails if the row count and the distinct serial count ever differ.',
    },
    links: [{ label: 'serial-margin-dbt on GitHub', href: 'https://github.com/KaydenPellegrini/serial-margin-dbt' }],
  },
  {
    id: 'rfid-stocktake',
    kicker: 'Hardware to report',
    title: 'RFID stocktake across three provinces',
    context:
      'Built at Virtumed. No screens from the real system are shown. The Build Lab has a reconstruction on synthetic data.',
    problem: [
      'Stock was counted by hand across three provinces. Counts were slow and hard to trust, and when one finished there was no clean way to separate what had been confirmed from what was missing and what had turned up where it was not expected.',
    ],
    built: [
      'Handheld RFID scanners feeding Power Apps and Dataverse, with Power Automate producing HTML and printable reports at the end of each count.',
      'The off-the-shelf capture path was too slow, so I wrote a native iOS app in Swift that decodes SGTIN-96 EPC tags and GS1 barcodes over Bluetooth Low Energy and passes serials straight into the stocktake app. Reconciliation is part of the count itself rather than a job for afterwards.',
    ],
    changed: [
      'A 30 item scan went from minutes to under 15 seconds. Every count reconciles confirmed, missing and unexpected stock in one pass, across all three provinces.',
    ],
    links: [{ label: 'Interactive reconstruction in the Build Lab', href: '/showcase#rfid-stocktake' }],
  },
  {
    id: 'ai-verification',
    kicker: 'AI systems',
    title: 'Not taking AI output at its word',
    context:
      'Built at Virtumed. The public audit skills use the same verification architecture.',
    problem: [
      'AI-generated changes to a real system cannot be taken at face value. A model will report a fix it did not make, rename something and call it a security improvement, or claim a control exists because the word appears in a comment. "It says it fixed it" is not evidence.',
    ],
    built: [
      'A multi-agent verification framework. Independent passes review and then confirm each change, and the confirming pass never sees the reasoning of the reviewing pass. An adjudication pass then checks every claimed change against the actual result and classifies it as verified, overclaimed, hallucinated, cosmetic or a regression.',
      'The LLM tooling itself reaches Dataverse, Power Apps and Microsoft 365 through Model Context Protocol, so analysis runs against the live systems instead of a pasted extract.',
      'Around it sit the standards I set for AI-assisted analysis on live systems: one source of truth per data domain, confidence labelling, read-only scoping, human confirmation before anything destructive runs, no merging of records that have not been verified, and no margin calculated from a placeholder cost.',
    ],
    changed: [
      'A repeatable way to trust or reject AI output on production systems, decided by what actually changed rather than by what the model says changed.',
    ],
    links: [{ label: 'readiness-audits on GitHub', href: 'https://github.com/KaydenPellegrini/readiness-audits' }],
  },
]

export type RepoCard = {
  id: string
  name: string
  title: string
  summary: string
  repoUrl: string
  snippet: Snippet
  caption: string
}

export const selectedWork: RepoCard[] = [
  {
    id: 'serial-margin-dbt',
    name: 'serial-margin-dbt',
    title: 'Serial level margin and purchase reconciliation',
    summary:
      'Gross margin rebuilt per serialised unit, from purchase order to invoice, on synthetic data. Nine data defects are planted on purpose, each one either handled by a model or caught by a test. Runs on DuckDB with no warehouse account, and CI runs the build on every push.',
    repoUrl: 'https://github.com/KaydenPellegrini/serial-margin-dbt',
    snippet: creditNotesTest,
    caption: 'A serial that was sold and then fully credited must not count as sold.',
  },
  {
    id: 'readiness-audits',
    name: 'readiness-audits',
    title: 'Audit skills that verify their own fixes',
    summary:
      'Two Claude Code audit skills, one for AI agents and one for conventional codebases. Every section runs through two independent sub-agents and then an adjudicator whose job is to catch the first two overstating what they did.',
    repoUrl: 'https://github.com/KaydenPellegrini/readiness-audits',
    snippet: adjudicatorContract,
    caption: 'Part of the contract the adjudicator works to. It reads the diff, not the report.',
  },
]

export const skillsGrid: { label: string; items: string[] }[] = [
  { label: 'Data', items: ['SQL', 'Python', 'dbt', 'DuckDB', 'Data modelling', 'Data quality testing'] },
  { label: 'Power Platform', items: ['Power Apps', 'Power Automate', 'Dataverse', 'Power BI', 'DAX', 'Power Fx'] },
  { label: 'AI systems', items: ['Model Context Protocol', 'LLM tooling', 'Agent evaluation'] },
  { label: 'Integration', items: ['Sage Accounting', 'REST APIs', 'PrintNode', 'Entra ID', 'Cloudflare Access', 'AWS EC2'] },
  { label: 'Hardware', items: ['RFID', 'SGTIN-96 and EPC', 'GS1 and DataMatrix', 'Bluetooth Low Energy', 'Swift'] },
]

/** One line per role for the timeline. Keyed by the role ids in profile.ts. */
export const timelineNotes: Record<string, string> = {
  virtumed: 'Data model, integration, reporting, apps, hardware and AI tooling for a medical device distributor.',
  'hashtag-escape':
    'Ran daily operations and bookings, and maintained and troubleshot the room equipment, control software and technical systems, diagnosing faults between live sessions.',
  'fat-ginger': 'Customer service and floor operations in a high volume restaurant.',
}
