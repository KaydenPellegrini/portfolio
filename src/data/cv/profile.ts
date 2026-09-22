/**
 * Facts and CV wording.
 *
 * Two kinds of content live here:
 *
 *   Facts shared by the site and the CV: identity, contact details, roles and
 *   dates, education and languages. Change a date here and both follow.
 *
 *   The CV's own wording: profile, key skills, experience bullets and selected
 *   work. The site deliberately does not reuse any of it. Its narrative lives in
 *   src/data/site/home.ts, so a reader who already has the CV still learns
 *   something new on the site.
 *
 * scripts/generate-cv.mjs transpiles this file on its own, so it must not
 * import anything.
 *
 * The CV served from public/ is currently a finished PDF supplied by hand, and
 * the CV wording below is kept in step with it. `npm run cv` rebuilds the PDF
 * from this file and would replace the supplied one, so only run it to switch
 * back to the generated CV on purpose.
 *
 * Every claim and figure in here is real. Do not add one that is not.
 */

export type Contact = {
  email: string
  phone: string
  linkedin: string
  github: string
  website: string
}

/**
 * A CV bullet. The lead phrase is set in bold so the list can be skimmed.
 * Earlier roles leave it out: they are there to show continuous employment, and
 * bold would pull the eye towards them.
 */
export type Bullet = {
  lead?: string
  rest: string
}

export type Role = {
  id: string
  role: string
  /** Legal name, as printed on the CV. */
  company: string
  /** Short name, as used on the site. */
  employer: string
  location: string
  period: string
  bullets: Bullet[]
}

export type EducationEntry = {
  qualification: string
  place: string
  period: string
  notes: string[]
  subjects?: string[]
}

export type SkillLine = {
  label: string
  items: string[]
}

export type SelectedWork = {
  title: string
  description: string
  url?: string
}

// ------------------------------------------------------------------- facts --

export const identity = {
  name: 'Kayden Pellegrini',
  title: 'Data Engineer | AI Systems Developer',
  location: 'Edenvale, Johannesburg, South Africa',
}

export const workAuthorisation =
  'Italian and South African citizen. Full EU work authorisation, no sponsorship required.'

export const contact: Contact = {
  email: 'developer.kayden@gmail.com',
  phone: '064 511 5136',
  linkedin: 'https://linkedin.com/in/kaydenpellegrini',
  github: 'https://github.com/KaydenPellegrini',
  website: 'https://kayden.co.za',
}

export const languages = ['English (fluent)', 'Afrikaans (moderate)']

export const education: EducationEntry[] = [
  {
    qualification: 'Diploma in Systems Development',
    place: 'Boston City Campus',
    period: '2021 to 2023',
    notes: ['Certificate received 2024', 'NQF Level 6'],
    subjects: [
      'Java',
      'Database Programming',
      'SQL',
      'Android Application Development',
      'Systems Analysis and Design',
      'Workflow Management',
      'Software Testing',
      'Technical Systems and Support',
      'Systems Development Project Management',
    ],
  },
  {
    qualification: 'National Senior Certificate',
    place: 'Jeppe High School for Boys',
    period: '2016 to 2020',
    notes: [],
  },
]

/**
 * Past tense for completed builds, present tense for what is still owned.
 * Ranked by what a hiring manager reads first, not by when it happened.
 */
export const experience: Role[] = [
  {
    id: 'virtumed',
    role: 'Data and Systems Developer',
    company: 'Virtumed (Pty) Ltd',
    employer: 'Virtumed',
    location: 'Johannesburg',
    period: 'April 2024 to present',
    bullets: [
      {
        lead: 'Own the operational data model in Dataverse',
        rest: ', including migrating purchase orders from comma-separated product strings to a one-row-per-unit line model, giving serial level traceability from each inventory record back to its purchase order line and landed cost.',
      },
      {
        lead: 'Rebuilt landed cost and gross margin from source transactions',
        rest: ', reconstructing cost from supplier price and actual exchange rate, with customs, freight and bank charges allocated to each unit by weighted value share, so margin by product is measured against real cost rather than list price or valuation figures.',
      },
      {
        lead: 'Reconciled a 6,984 line purchases export across 145 suppliers',
        rest: ' against a separate item level report, and merged a 16,597 row inventory register from two misaligned source tables.',
      },
      {
        lead: 'Built the RFID stocktake system',
        rest: ' end to end using handheld scanners, Power Apps, Dataverse and Power Automate, reconciling confirmed, missing and unexpected stock in a single pass across three provinces, with automated HTML and printable reports.',
      },
      {
        lead: 'Wrote a native iOS capture app in Swift',
        rest: ' that decodes SGTIN-96 EPC tags and GS1 barcodes over Bluetooth Low Energy into the stocktake app, cutting a 30 item scan from minutes to under 15 seconds.',
      },
      {
        lead: 'Designed and built a multi-agent verification framework for AI-generated work',
        rest: ': independent review and confirmation passes followed by an adjudication pass that checks each change against the actual result and classifies it as verified, overclaimed, hallucinated, cosmetic or a regression.',
      },
      {
        lead: 'Integrated LLM tooling into the Microsoft stack through Model Context Protocol',
        rest: ' across Dataverse, Power Apps and Microsoft 365, and set the internal standards for AI-assisted analysis: one source of truth per data domain, confidence labelling, read-only scoping on live systems, human confirmation before destructive operations.',
      },
      {
        lead: 'Design and maintain the data flows between Sage Accounting, Dataverse, internal web applications and the reporting layer',
        rest: ' using REST APIs, Power Automate and Python, including the PrintNode integration that processes and prints delivery notes.',
      },
      {
        lead: 'Build the internal applications operations runs on',
        rest: ' for procurement, inventory, stock movement, stocktaking and receiving in Power Apps and Dataverse, published behind Cloudflare Access and Microsoft Entra.',
      },
      {
        lead: 'Built GS1 barcode receiving in Power Apps',
        rest: ' that parses GTIN, expiry and lot from scanned codes, matches each unit against the expected purchase order lines, and writes serials back to the order and into inventory.',
      },
      {
        lead: 'Build Power BI reporting',
        rest: ' across sales, inventory, stock risk, locations and product groups, including actuals against target on a March financial year with drill-down from month to day.',
      },
      {
        lead: 'Apply data quality controls as standard practice',
        rest: ': join validation before results are trusted, duplicate and truncation checks, grain control on serialised records, untouched source files, a logged transformation trail, and explicit separation of verified results from assumptions in every output.',
      },
      {
        lead: 'Technical lead for a cross-site medical broadcast system',
        rest: ' used during live clinical cases, provisioning and running an AWS EC2 relay in the Cape Town region as the low latency endpoint linking sites, alongside vMix production, NDI and SRT transport, and network design.',
      },
    ],
  },
  {
    id: 'hashtag-escape',
    role: 'Escape Room Manager',
    company: 'Hashtag Escape',
    employer: 'Hashtag Escape',
    location: 'Johannesburg',
    period: 'February 2022 to March 2024',
    bullets: [
      {
        rest: 'Ran daily operations and bookings, and maintained and troubleshot the room equipment, control software and technical systems, diagnosing faults between live sessions. Synced bookings through the Acuity API.',
      },
    ],
  },
  {
    id: 'fat-ginger',
    role: 'Waiter',
    company: 'The Fat Ginger',
    employer: 'The Fat Ginger',
    location: 'Johannesburg',
    period: 'June 2021 to January 2022',
    bullets: [
      {
        rest: 'Customer service and floor operations in a high volume restaurant.',
      },
    ],
  },
]

// --------------------------------------------------------------- CV wording --

export const cvProfile = [
  'Data engineer building the operational data layer for a medical device distributor in Johannesburg: Dataverse modelling, Sage integration, Power BI reporting, and the Power Apps and Power Automate systems that procurement, inventory and stocktaking run on. I rebuild cost and margin at the grain of the individual serialised unit, reconcile systems that disagree with each other, and write tests that fail the build when a number stops being trustworthy.',
  'Alongside that I build LLM tooling connected to live business systems through Model Context Protocol, including a multi-agent verification framework that classifies AI-generated changes as verified, overclaimed, hallucinated, cosmetic or a regression, and the internal standards governing what AI-assisted analysis is allowed to claim.',
]

export const cvSkills: SkillLine[] = [
  {
    label: 'Data engineering',
    items: ['SQL', 'Python', 'dbt', 'DuckDB', 'ETL', 'data modelling', 'data quality testing', 'reconciliation', 'Git', 'GitHub Actions', 'CI/CD'],
  },
  {
    label: 'Power Platform and BI',
    items: ['Power Apps', 'Power Automate', 'Dataverse', 'Power BI', 'DAX', 'Power Fx', 'Excel'],
  },
  {
    label: 'AI systems',
    items: ['Model Context Protocol', 'LLM tooling', 'agent evaluation', 'prompt engineering', 'Claude Code skills'],
  },
  {
    label: 'Integration',
    items: ['REST APIs', 'JSON', 'Sage Accounting', 'PrintNode', 'SharePoint', 'Microsoft Entra ID', 'Cloudflare Access', 'AWS EC2'],
  },
  {
    label: 'Languages',
    items: ['Python', 'SQL', 'TypeScript', 'Swift', 'Java', 'JavaScript', 'HTML and CSS', 'Next.js', 'React'],
  },
  {
    label: 'Identification and hardware',
    items: ['RFID', 'SGTIN-96 and EPC decoding', 'GS1 barcode and DataMatrix', 'Bluetooth Low Energy', 'mobile scanner integration'],
  },
  {
    label: 'Broadcast and delivery',
    items: ['vMix', 'NDI', 'SRT', 'networking', 'system testing', 'deployment', 'troubleshooting'],
  },
]

/** Only things a reader can go and look at independently. */
export const cvSelectedWork: SelectedWork[] = [
  {
    title: 'Serial Level Margin and Purchase Reconciliation',
    description:
      'A dbt project on synthetic data that rebuilds gross margin at the grain of the individual serialised unit, from purchase order through to invoice.',
    url: 'https://github.com/KaydenPellegrini/serial-margin-dbt',
  },
  {
    title: 'Readiness Audits',
    description:
      'Two Claude Code audit skills that verify their own fixes, one for AI agents and one for conventional codebases.',
    url: 'https://github.com/KaydenPellegrini/readiness-audits',
  },
  {
    title: 'kayden.co.za',
    description: 'Personal site and portfolio, built and deployed independently.',
  },
]

/** File name of the CV in public/. The site's download links point here. */
export const cvFileName = 'Kayden-Pellegrini-CV-2026.pdf'
