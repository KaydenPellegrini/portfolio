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
  bullets: string[]
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
  title: 'Business Systems Developer | Data Analyst | Power Platform Specialist',
  location: 'Edenvale / Johannesburg, South Africa',
}

export const contact: Contact = {
  email: 'developer.kayden@gmail.com',
  phone: '064 511 5136',
  linkedin: 'https://linkedin.com/in/kaydenpellegrini',
  github: 'https://github.com/KaydenPellegrini',
  website: 'https://kayden.co.za',
}

/** Short hero paragraph. Kept to one sentence pair on purpose. */
export const heroSummary =
  'I build internal systems, analytics and automations that are used in day to day business operations. The work spans Power Platform, Power BI, APIs, RFID and technical infrastructure.'

/** Longer About copy for the site, and the CV professional summary. */
export const summary = [
  'I work as a developer and business intelligence analyst for a medical device distribution company in Johannesburg. Most of what I build sits inside live operations: procurement, inventory, stock movement, stocktaking, receiving and the reporting that management uses to make decisions.',
  'The core of the work is Power Apps and Dataverse for internal applications, Power BI for reporting and forecasting, and Power Automate for the workflows that connect those systems to finance, printing and email. Around that I work with RFID hardware, REST APIs, secure internal web pages and broadcast AV infrastructure.',
]

export const pillars: Pillar[] = [
  {
    id: 'systems-development',
    name: 'Systems Development',
    description:
      'Internal business applications built around how a team actually works, from requirements through to implementation and support.',
    skills: ['Power Apps', 'Dataverse', 'HTML', 'Requirements analysis', 'System implementation'],
  },
  {
    id: 'data-and-analytics',
    name: 'Data and Analytics',
    description:
      'Reporting and analysis on sales, stock and performance, including forecasting from historical company data and reconciliation work.',
    skills: ['Power BI', 'DAX', 'Excel', 'SQL', 'Forecasting', 'Data validation', 'Reconciliation'],
  },
  {
    id: 'automation-and-integration',
    name: 'Automation and Integration',
    description:
      'Workflows that move information between systems so operational activity reaches finance and documentation without manual re-entry.',
    skills: ['Power Automate', 'REST APIs', 'JSON', 'Sage Accounting', 'PrintNode'],
  },
  {
    id: 'technical-delivery',
    name: 'Technical Delivery',
    description:
      'The hardware, access and infrastructure side: scanners, deployment, secure application access, troubleshooting and broadcast AV.',
    skills: ['RFID systems', 'Mobile scanner integration', 'Deployment', 'Troubleshooting', 'Secure access', 'Broadcast AV'],
  },
]

export const experience: Role[] = [
  {
    role: 'Developer / Business Intelligence',
    company: 'Virtumed (Pty) Ltd',
    location: 'Johannesburg, Gauteng',
    period: 'April 2024 to Present',
    bullets: [
      'Design, develop and maintain internal systems for procurement, inventory, stock movement, stocktaking, receiving and reporting using Power Apps, Power Automate and Dataverse.',
      'Build Power BI dashboards and reports covering sales, inventory, stock risk, representative performance, locations, product groups and management reporting.',
      'Use historical company data for forecasting and comparative analysis.',
      'Use Excel and business system data for analysis, validation and reconciliation.',
      'Build Power Automate workflows to automate repetitive processes.',
      'Integrated Sage Accounting with Power Automate and PrintNode for delivery note processing and printing.',
      'Built an RFID stocktake system using handheld RFID scanners, Power Apps, Dataverse and Power Automate.',
      'Developed scanner input functionality for mobile RFID capture.',
      'Created automated HTML email and printable stocktake reports.',
      'Work with serialised medical device inventory, stock movements, receiving, replenishment, stocktakes, discrepancies and location control.',
      'Support purchasing and stock provisioning through purchase order validation, supplier and product checks, replenishment requirements and stock analysis.',
      'Develop secure internal web pages using HTML, Cloudflare Access, Cloudflare Zero Trust and Microsoft Entra authentication.',
      'Work with finance, stock, sales, logistics and management to gather requirements and build internal systems.',
      'Test, deploy, troubleshoot and support internal systems.',
      'Research and evaluate technical systems, equipment and vendor proposals.',
      'Work with broadcast and AV infrastructure for medical events.',
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
    name: 'Data and BI',
    skills: ['Power BI', 'DAX', 'Excel', 'SQL', 'Data modelling', 'Forecasting', 'Data validation', 'Reconciliation'],
  },
  {
    name: 'Power Platform',
    skills: ['Power Apps', 'Power Automate', 'Dataverse'],
  },
  {
    name: 'Systems and Integration',
    skills: ['REST APIs', 'JSON', 'Sage Accounting', 'PrintNode', 'HTML', 'SharePoint', 'Microsoft Entra ID', 'Cloudflare Access'],
  },
  {
    name: 'Technical',
    skills: ['RFID', 'Barcode systems', 'vMix', 'NDI', 'Networking', 'System testing', 'Deployment', 'Troubleshooting'],
  },
  {
    name: 'Development Foundation',
    skills: ['Java', 'SQL', 'Android development', 'HTML', 'CSS'],
  },
]

export const languages = ['English (fluent)', 'Afrikaans (moderate)']

/** Path of the generated CV in public/. The hero download link points here. */
export const cvFileName = 'Kayden-Pellegrini-CV-2026.pdf'
