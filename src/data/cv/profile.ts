/**
 * Single source of truth for professional content.
 *
 * Both the website (src/app/page.tsx) and the downloadable CV
 * (scripts/generate-cv.mjs -> public/Kayden-Pellegrini-CV-2026.pdf) read from
 * this file, so the two can never drift apart. Edit here, then run:
 *
 *   npm run cv
 *
 * Keep the copy plain and factual. Nothing in this file should describe work
 * that was not actually done.
 */

export type Contact = {
  email: string
  phone: string
  linkedin: string
  github: string
  website: string
}

export type Pillar = {
  id: string
  name: string
  description: string
  skills: string[]
}

export type Role = {
  role: string
  company: string
  location: string
  period: string
  /** Ordered strongest first. The site renders all of them. */
  bullets: string[]
  /**
   * How many bullets the CV prints, since it has to fit two pages while the
   * site does not. Because `bullets` is ordered by importance, truncating takes
   * the weakest off the end. Omit to print all of them.
   */
  cvMaxBullets?: number
}

export type EducationEntry = {
  qualification: string
  place: string
  period: string
  notes: string[]
  subjects?: string[]
}

export type SkillGroup = {
  name: string
  skills: string[]
}

export const identity = {
  name: 'Kayden Pellegrini',
  title: 'Data Engineer | AI Systems Developer',
  location: 'Edenvale / Johannesburg, South Africa',
}

/** Shown next to the contact details on the site and in the CV. */
export const workAuthorisation =
  'Italian and South African citizen. Full EU work authorisation, no sponsorship required.'

export const contact: Contact = {
  email: 'developer.kayden@gmail.com',
  phone: '064 511 5136',
  linkedin: 'https://linkedin.com/in/kaydenpellegrini',
  github: 'https://github.com/KaydenPellegrini',
  website: 'https://kayden.co.za',
}

/** Short hero paragraph. Kept to one sentence pair on purpose. */
export const heroSummary =
  'I build the data layer and the AI layer that business operations run on. Pipelines and models that produce a number people can stand behind, and LLM tooling connected to the systems those numbers come from.'

/** Longer About copy for the site, and the CV professional summary. */
export const summary = [
  'On the data side I work on modelling, cost and margin at the grain of the individual unit, reconciliation between systems that disagree with each other, and tests that fail the build when a number stops being trustworthy. On the AI side I work on LLM tooling connected to live business systems through Model Context Protocol, audit skills that verify their own fixes, and a written set of standards for what AI-assisted analysis is allowed to claim.',
  'I do this for a medical device distribution company in Johannesburg, where I also build the internal applications and reporting that operations runs on. That covers procurement, inventory, stock movement, stocktaking and receiving in Power Apps and Dataverse, reporting and forecasting in Power BI, and the Power Automate workflows that connect those to finance, printing and email. Around that I work with RFID and barcode identification, REST APIs, secure internal web pages and broadcast AV infrastructure.',
]

export const pillars: Pillar[] = [
  {
    id: 'data-engineering',
    name: 'Data Engineering',
    description:
      'Pipelines and models that produce a defensible number. Cost and margin at unit grain, reconciliation between systems that disagree, and tests that fail the build when the data stops holding up.',
    skills: ['dbt', 'DuckDB', 'SQL', 'Python', 'Data modelling', 'Data quality testing', 'Reconciliation'],
  },
  {
    id: 'ai-systems',
    name: 'AI Systems',
    description:
      'LLM tooling connected to live business systems through Model Context Protocol, audit skills that verify their own fixes, and written standards for what AI-assisted analysis is allowed to claim.',
    skills: ['Model Context Protocol', 'LLM tooling', 'Prompt engineering', 'Agent evaluation'],
  },
  {
    id: 'business-systems',
    name: 'Business Systems and Automation',
    description:
      'Internal applications, reporting and workflow automation used in day to day operations, from requirements through to implementation and support.',
    skills: ['Power Apps', 'Dataverse', 'Power Automate', 'Power BI', 'DAX', 'REST APIs', 'Sage Accounting'],
  },
  {
    id: 'technical-delivery',
    name: 'Technical Delivery',
    description:
      'Hardware, identification and infrastructure. RFID and barcode capture, deployment, secure application access, troubleshooting and broadcast AV.',
    skills: ['RFID', 'SGTIN-96 and EPC', 'GS1 and DataMatrix', 'Bluetooth Low Energy', 'AWS EC2', 'Networking'],
  },
]

/**
 * AI and LLM work. Two areas plus the standards that govern them, kept here so
 * the site section and the CV read from the same place.
 */
export const aiWork = {
  intro:
    'Most of what I do with AI is making it usable against real systems and then constraining what it is allowed to say. The integrations matter less than the rules around them.',
  areas: [
    {
      name: 'LLM tooling in the Microsoft stack',
      description:
        'Model Context Protocol integrations that give LLM tooling working access to Dataverse, Power Apps and Microsoft 365, so analysis runs against the live systems instead of a pasted extract.',
      tags: ['Model Context Protocol', 'Dataverse', 'Power Apps', 'Microsoft 365'],
    },
    {
      name: 'Reusable validation and analysis modules',
      description:
        'Validation and analysis modules built once and shared with colleagues, so the same checks get applied the same way by other people rather than being rewritten from scratch each time.',
      tags: ['Validation', 'Analysis', 'Shared tooling'],
    },
  ],
  standardsIntro:
    'The standards I set for AI-assisted analysis on our systems. They exist because a confident wrong answer is worse than no answer.',
  standards: [
    'One stated source of truth per data domain.',
    'Confidence labelling on every answer.',
    'Read-only scoping on live systems.',
    'Human confirmation before any destructive operation.',
    'No merging of records that have not been verified.',
    'No margin calculated from a placeholder cost.',
  ],
}

export const experience: Role[] = [
  {
    role: 'Data and Systems Developer',
    company: 'Virtumed (Pty) Ltd',
    location: 'Johannesburg, Gauteng',
    period: 'April 2024 to Present',
    // Ordered data engineering, then AI, then Power Platform and delivery.
    // The CV prints the first `cvMaxBullets`.
    cvMaxBullets: 15,
    bullets: [
      'Design and maintain the data flows that move transactional data between Sage Accounting, Dataverse, internal web applications and the reporting layer, using REST APIs, Power Automate and Python.',
      'Model the operational data in Dataverse, including the table relationships and the serial level traceability that links inventory records to purchase order lines and their actual cost.',
      'Reconcile and rebuild business datasets before they are used for analysis, including a 6,984 line purchases export across 145 suppliers cross checked against a separate item level report, and a 16,597 row inventory register merged from two misaligned source tables.',
      'Build cost and margin models from source transaction data, reconstructing landed cost from supplier price, actual exchange rate, freight, customs and bank charges rather than list price or valuation figures.',
      'Apply data quality controls as standard practice, covering join validation before results are trusted, duplicate and truncation checks, grain control on serialised records, and explicit separation of verified results from assumptions in every output.',
      'Write Python for data processing and validation with reproducibility in mind, keeping source files untouched, logging every transformation applied, and proving logic on a slice before running it at full scale.',
      'Designed and built a multi agent verification framework for AI generated work, using independent review and confirmation passes followed by an adjudication pass that checks each change against the actual result and classifies it as verified, overclaimed, hallucinated, cosmetic or a regression.',
      'Integrated LLM tooling into the Microsoft stack through Model Context Protocol across Dataverse, Power Apps and Microsoft 365.',
      'Set the internal standards for AI-assisted analysis, covering one source of truth per data domain, confidence labelling, read-only scoping on live systems and human confirmation before destructive operations.',
      'Built reusable validation and analysis modules and shared them with colleagues.',
      'Build Power BI dashboards and reports covering sales, inventory, stock risk, sales activity, locations and product groups, with forecasting and comparative analysis from historical company data.',
      'Design, develop and maintain the internal systems for procurement, inventory, stock movement, stocktaking, receiving and reporting in Power Apps, Power Automate and Dataverse, including the Sage Accounting and PrintNode integration that processes and prints delivery notes.',
      'Built an RFID stocktake system using handheld RFID scanners, Power Apps, Dataverse and Power Automate, with automated HTML email and printable stocktake reports.',
      'Developed a native iOS capture application in Swift that decodes SGTIN-96 EPC tags and GS1 barcodes over Bluetooth Low Energy and feeds serials directly into the stocktake app, cutting a 30 item scan to under 15 seconds.',
      'Act as technical lead for a cross site medical broadcast system used during live clinical cases, including provisioning and running an AWS EC2 relay in the Cape Town region as the low latency endpoint linking sites, alongside vMix production, NDI and SRT transport and network design.',
      'Develop secure internal web pages using HTML, Cloudflare Access, Cloudflare Zero Trust and Microsoft Entra authentication.',
      'Support purchasing and stock provisioning through purchase order validation, supplier and product checks, replenishment requirements and stock analysis.',
    ],
  },
  {
    role: 'Escape Room Manager',
    company: 'Hashtag Escape',
    location: 'Johannesburg, Gauteng',
    period: 'February 2022 to March 2024',
    bullets: [
      'Managed daily escape room operations and bookings.',
      'Managed and troubleshot room equipment, software and technical systems.',
      'Diagnosed faults between sessions.',
      'Supported customers and daily operations.',
    ],
  },
  {
    role: 'Waiter',
    company: 'The Fat Ginger',
    location: 'Johannesburg, Gauteng',
    period: 'June 2021 to January 2022',
    bullets: ['Customer service and daily floor operations in a busy restaurant.'],
  },
]

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

export const skillGroups: SkillGroup[] = [
  {
    name: 'Data Engineering',
    skills: ['dbt', 'DuckDB', 'SQL', 'Python', 'ETL', 'Data modelling', 'Data quality testing', 'Reconciliation', 'Forecasting', 'Git', 'GitHub Actions', 'CI/CD'],
  },
  {
    name: 'AI',
    skills: ['Model Context Protocol', 'LLM tooling', 'Prompt engineering', 'Agent evaluation', 'Claude Code skills'],
  },
  {
    name: 'Power Platform and BI',
    skills: ['Power Apps', 'Power Automate', 'Dataverse', 'Power BI', 'DAX', 'Excel'],
  },
  {
    name: 'Languages and Frameworks',
    skills: ['Python', 'TypeScript', 'Swift', 'Java', 'Next.js', 'React', 'Three.js and WebGL', 'Android development', 'HTML', 'CSS'],
  },
  {
    name: 'Systems and Integration',
    skills: ['REST APIs', 'JSON', 'Sage Accounting', 'PrintNode', 'SharePoint', 'Microsoft Entra ID', 'Cloudflare Access', 'AWS EC2'],
  },
  {
    name: 'Identification and Hardware',
    skills: ['RFID', 'SGTIN-96 and EPC decoding', 'GS1 barcode and DataMatrix', 'Bluetooth Low Energy', 'Barcode systems', 'Mobile scanner integration'],
  },
  {
    name: 'Delivery and Broadcast',
    skills: ['System testing', 'Deployment', 'Troubleshooting', 'Networking', 'vMix', 'NDI'],
  },
]

export const languages = ['English (fluent)', 'Afrikaans (moderate)']

/** Path of the generated CV in public/. The hero download link points here. */
export const cvFileName = 'Kayden-Pellegrini-CV-2026.pdf'
