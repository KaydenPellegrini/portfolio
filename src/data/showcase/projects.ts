/**
 * Showcase data. The single file to edit when adding work.
 *
 * Every project answers the same six questions (see `CaseStudy`) so a recruiter
 * can understand it from the text alone, without touching an interactive panel.
 *
 * Each project also picks ONE `display` mode:
 *   - rfid  : interactive reconstruction of the RFID stocktake reconciliation
 *   - bi    : interactive synthetic reporting dashboard
 *   - flow  : architecture / workflow diagram, optionally with example payloads
 *   - embed : live, clickable iframe of a running project
 *   - build : an animated "watch it get built" simulation
 *   - video : a looping screen-capture walkthrough
 *   - case  : case-study only, with a screenshot gallery
 *   - none  : case-study text only, no visual panel yet
 *
 * CONFIDENTIALITY RULE: nothing here may contain real customer, hospital,
 * financial or employer data. Product names, serial numbers, references,
 * endpoints and figures in the demonstrations are fabricated, and every
 * professional project states what has been sanitised in `case.sanitised`.
 */

export type BuildStep = {
  /** A short line of code shown typing into the code panel. */
  code: string
  /** Label of the UI block that snaps into the preview panel for this step. */
  block: string
  /** Optional secondary caption under the block. */
  caption?: string
  /** Which preview region the block lands in (drives layout in BuildSimulation). */
  region?: 'header' | 'main' | 'aside' | 'footer'
}

/** One stage in an architecture / workflow diagram. */
export type FlowStage = {
  name: string
  /** One line explaining what happens at this stage. */
  role: string
  /** Short labels for the parts involved. */
  detail?: string[]
}

/** A fabricated request or payload shown next to a flow diagram. */
export type FlowPayload = {
  title: string
  note: string
  code: string
}

export type ShowcaseDisplay =
  | { kind: 'embed'; url: string; title?: string }
  | { kind: 'build'; language?: string; steps: BuildStep[] }
  | { kind: 'video'; src: string; poster?: string }
  | { kind: 'case'; gallery: string[] }
  | { kind: 'flow'; stages: FlowStage[]; payload?: FlowPayload }
  | { kind: 'rfid' }
  | { kind: 'bi' }
  | { kind: 'none' }

/** The six questions every project answers. */
export type CaseStudy = {
  /** What was the problem? */
  problem: string
  /** What did I build? */
  built: string
  /** What technology did I use? */
  technology: string
  /** What part did I personally own? */
  ownership: string
  /** What was the outcome? */
  outcome: string
  /** What has been sanitised or simulated for confidentiality? */
  sanitised: string
}

export type ShowcaseProject = {
  id: string
  title: string
  /** One-line hook shown on the card. */
  summary: string
  stack: string[]
  year: string
  /** Short tag shown as the card's mode badge, e.g. "Interactive demo". */
  badge: string
  /** Public repository, employer work, or personal development work. Drives grouping. */
  category: 'open-source' | 'professional' | 'personal'
  /** Where the work was done. Omitted for personal builds. */
  context?: string
  case: CaseStudy
  links?: { live?: string; repo?: string }
  display: ShowcaseDisplay
}

export const showcaseProjects: ShowcaseProject[] = [
  {
    id: 'serial-margin-dbt',
    title: 'Serial Level Margin and Purchase Reconciliation',
    summary:
      'A dbt project that rebuilds gross margin at the grain of the individual serialised unit, from purchase order to invoice, on synthetic data.',
    stack: ['dbt', 'DuckDB', 'SQL', 'Python', 'GitHub Actions'],
    year: '2026',
    badge: 'Public repository',
    category: 'open-source',
    context: 'Open source',
    links: { repo: 'https://github.com/KaydenPellegrini/serial-margin-dbt' },
    case: {
      problem:
        'A distribution business buys stock abroad on a purchase order, pays freight, customs and bank charges on the shipment as a whole, holds the stock as individually numbered units, and sells those units one at a time months later. Asking what the margin was on one unit sounds like a single query. It is not. The unit cost is the supplier price at the exchange rate actually paid plus that unit share of the shipment charges, the selling price is on the invoice rather than in the product master, and the serial that joins the two appears in three systems, is sometimes captured twice, and sometimes refers to a unit no purchase record can explain. Averaging cost to the product code makes all of that disappear and produces a number that is wrong in a direction nobody can see.',
      built:
        'A dbt project that rebuilds gross margin per serialised unit from purchase order through to invoice, and reconciles two aggregate purchase exports that disagree with each other. Landed cost is allocated by value across order lines rather than by piece, and the choice is written down where the calculation happens. Selling price comes from the invoice line only, never from the current list price in the product master. A row that cannot be costed carries a null margin and a stated reason instead of a zero, and everything that could not be stood behind is listed in a data quality table.',
      technology:
        'dbt and DuckDB, so it runs anywhere with no warehouse account and no package dependencies. SQL for the models, a Python generator for the synthetic seed data, and GitHub Actions building and testing on every push.',
      ownership:
        'All of it. The staging, intermediate and mart models, the allocation method, the narrow normalisation macro, the 37 tests, and the nine defects planted deliberately in the seed data.',
      outcome:
        'Nine data defects are planted on purpose and the tests catch them, including a leading zero dropped from a product code, a duplicate serial that would fan out a join, a purchase order with a zero exchange rate, an invoice for a serial never purchased, a credit note captured as a negative quantity, two exports of the same purchases that do not agree, and a current list price sitting next to everything that needs a price. On the committed seed, the build produces 402 invoiced serials, of which 396 carry a margin and 6 are excluded with a stated reason.',
      sanitised:
        'All data is synthetic rather than changed. The products, suppliers, customers, serials and prices are generated by a script in the repository, and nothing in it comes from any employer system. The repository is fully public, so everything described here can be read and run.',
    },
    display: {
      kind: 'flow',
      stages: [
        {
          name: 'Seeds',
          role: 'Synthetic exports generated by script, with nine defects planted on purpose.',
          detail: ['Python', 'CSV'],
        },
        {
          name: 'Staging',
          role: 'Typed and trimmed, one concern per model, original values kept next to repaired ones.',
          detail: ['dbt', 'Normalisation macro'],
        },
        {
          name: 'Intermediate',
          role: 'Landed cost allocated by value, one row per physical unit, invoice lines netted per serial.',
          detail: ['int_po_line_landed_cost', 'int_serial_cost', 'int_sales_serial'],
        },
        {
          name: 'Marts',
          role: 'Margin per invoiced serial, variance between the two exports, and everything that could not be stood behind.',
          detail: ['fct_serial_margin', 'fct_purchase_reconciliation', 'fct_data_quality_log'],
        },
        {
          name: 'Tests and CI',
          role: 'Thirty seven tests, nine written for the failure modes this domain actually produces, run on every push.',
          detail: ['dbt test', 'GitHub Actions'],
        },
      ],
      payload: {
        title: 'The nine planted defects',
        note: 'All seed data is synthetic. Full detail is in DEFECTS.md in the repository.',
        code: `1  Leading zero dropped from a product code after a spreadsheet round trip
2  The same serial captured on two purchase order lines
3  One customer name arriving with trailing whitespace and three casings
4  A purchase order with an exchange rate of zero
5  An invoice for a serial that was never purchased
6  A credit note captured as a negative quantity against a sold serial
7  Two aggregate exports of the same purchases that do not agree
8  A current list price sitting next to everything that needs a price
9  A serialised product missing from the product master while still trading`,
      },
    },
  },
  {
    id: 'readiness-audits',
    title: 'Readiness Audits',
    summary:
      'Two Claude Code audit skills that verify their own fixes, one for AI agents and one for normal codebases.',
    stack: ['Claude Code skills', 'Sub-agent orchestration', 'Python', 'Prompt engineering'],
    year: '2026',
    badge: 'Public repository',
    category: 'open-source',
    context: 'Open source',
    links: { repo: 'https://github.com/KaydenPellegrini/readiness-audits' },
    case: {
      problem:
        'An LLM asked to audit code will confidently report fixes it did not make. It will rename a variable and call it a security fix, or claim a control exists because the word appears in a comment. Reviewing that output by hand costs more than doing the work yourself, which is how unverified changes end up in production.',
      built:
        'Two audit skills for Claude Code that share one verification architecture. Every section runs through two independent sub-agents, Check-and-Replace and then Confirm-and-Fix, which does not see the first agent reasoning and re-checks the section against the real state of the code. An adjudicator then re-analyses every decision from both passes against the actual diff. One skill audits an AI agent across nine sections including the lethal trifecta and prompt injection exposure. The other audits a normal codebase for security, data and compliance, testing, resilience, observability, CI/CD, data layer and API design.',
      technology:
        'Claude Code skills with three sub-agent contracts, a Python static pre-scan that seeds each audit with candidate signals, and reference material covering the section criteria, the agent roles, the classification taxonomy and the stack scoping rules.',
      ownership:
        'All of it. The verification architecture, the section checklists, the three sub-agent contracts, the classification taxonomy and the scoping that decides which sections apply to which stack.',
      outcome:
        'Every claimed fix is classified against the actual diff as verified, overclaimed, hallucinated, cosmetic, a regression, scope creep, or correctly left unresolved. That last class matters. Correctly flagging something you cannot fix scores better than quietly dropping it, and most audit tooling has no way to express that, so it encourages fake completion instead.',
      sanitised:
        'Nothing has been changed or withheld. The repository is public and contains no employer or client material. It is worth being clear about the limits: this is a checklist executed by a language model, not a scanner with guarantees. It finds a large class of common problems and will miss novel ones. It is not a penetration test, a compliance certification or legal advice.',
    },
    display: {
      kind: 'flow',
      stages: [
        {
          name: 'Section',
          role: 'One area of the checklist, for example guardrails, secrets or idempotency.',
          detail: ['Scoped to the stack'],
        },
        {
          name: 'Check-and-Replace',
          role: 'First independent pass. Finds issues in the section and applies fixes.',
          detail: ['Sub-agent 1'],
        },
        {
          name: 'Confirm-and-Fix',
          role: 'Second independent pass. Does not see the first agent reasoning and re-checks the section against the real state of the code.',
          detail: ['Sub-agent 2'],
        },
        {
          name: 'Adjudicator',
          role: 'Re-analyses every decision from both passes against the actual diff and classifies each claim.',
          detail: ['Reads the diff, not the report'],
        },
        {
          name: 'Report',
          role: 'Each claimed fix comes out with a classification attached, so an overstated fix is visible rather than buried.',
          detail: ['Per-section findings'],
        },
      ],
      payload: {
        title: 'How the adjudicator classifies a claimed fix',
        note: 'Definitions with worked examples live in each skill reference material.',
        code: `VERIFIED        the change exists and does what was claimed
OVERCLAIM       something changed, but less than claimed
HALLUCINATED    the claimed change is not in the diff
COSMETIC        change is real but does not affect the risk
REGRESSION      the fix broke something else
SCOPE-CREEP     unrequested changes outside the section
UNRESOLVED-OK   correctly left open and flagged, not silently dropped`,
      },
    },
  },
  {
    id: 'rfid-stocktake',
    title: 'RFID Stocktake and Inventory System',
    summary:
      'Handheld RFID scanning into Power Apps and Dataverse, with confirmed, missing and unexpected stock reconciled in one pass.',
    stack: ['Power Apps', 'Dataverse', 'Power Automate', 'RFID scanners', 'HTML reports'],
    year: '2026 to present',
    badge: 'Interactive reconstruction',
    category: 'professional',
    context: 'Virtumed (Pty) Ltd',
    case: {
      problem:
        'Stocktaking serialised inventory by hand is slow and hard to trust. Counting item by item across locations takes a long time, the same item can be recorded twice, and it is difficult to tell afterwards what was actually confirmed, what was never found, and what turned up where it was not expected.',
      built:
        'An RFID stocktake system. Handheld RFID scanners capture serial numbers into a Power Apps application backed by Dataverse. Scans are validated as they arrive, duplicates are handled rather than counted twice, and each count is reconciled into confirmed, missing and unexpected stock. Movement and audit records are written for the count, and Power Automate sends an automated HTML email report with a printable version.',
      technology:
        'Handheld RFID scanners, Power Apps, Dataverse, Power Automate, HTML email reports, and mobile scanner input handling including custom work around Bluetooth scanner input.',
      ownership:
        'I built the system: the Power Apps application, the Dataverse tables behind it, the scan validation and reconciliation logic, the movement and audit records, the automated HTML email and printable reports, and the mobile scanner input functionality. The Bluetooth scanner input on mobile needed custom work to reduce the delay between scans, which I wrote and tested against the hardware.',
      outcome:
        'Stocktakes run from a handheld scanner instead of a manual list. Each count produces a reconciled result set with confirmed, missing and unexpected items separated, an audit and movement record, and a report that goes out by email and can be printed.',
      sanitised:
        'Everything in the demonstration on this page is fabricated. The products, serial numbers, locations and counts are invented, and the interface is a reconstruction built for the portfolio. It is not the employer application, and no real inventory, customer or hospital data appears anywhere on this site.',
    },
    display: { kind: 'rfid' },
  },
  {
    id: 'business-intelligence',
    title: 'Business Intelligence and Forecasting',
    summary:
      'Power BI reporting across sales, inventory, stock risk, locations and product groups, with forecasting from historical data.',
    stack: ['Power BI', 'DAX', 'Excel', 'SQL', 'Data modelling'],
    year: '2025 to present',
    badge: 'Interactive reconstruction',
    category: 'professional',
    context: 'Virtumed (Pty) Ltd',
    case: {
      problem:
        'Sales and stock information sat in separate places. Answering a question like which locations are carrying stock risk, or how a product group is tracking against the same period last year, meant pulling numbers together by hand each time it was asked.',
      built:
        'A set of Power BI reports covering sales activity, inventory, stock oversight, locations and product groups, with comparative reporting for management and board review. Forecasting is built on historical company information so expected demand can be compared against current stock positions.',
      technology: 'Power BI, DAX, Excel, SQL, data modelling, and business system data for validation and reconciliation.',
      ownership:
        'I built the reports: the data model, the DAX measures, the comparative and forecasting logic, and the report layouts used for management and board reporting. I also do the validation and reconciliation work behind them, checking report figures against source business system and Excel data.',
      outcome:
        'The recurring questions have a report that answers them, so sales activity, stock risk and location or group comparisons can be reviewed directly rather than rebuilt each time. Forecasting from historical data is used alongside current stock positions when planning replenishment.',
      sanitised:
        'The dashboard on this page is a reconstruction using entirely fabricated data. Every figure, product group, location and trend is invented. No real sales, stock, customer or financial information from any employer is shown here.',
    },
    display: { kind: 'bi' },
  },
  {
    id: 'sage-print-automation',
    title: 'Sage and Print Automation',
    summary:
      'Power Automate moving operational delivery information into Sage Accounting and out to a physical printer through PrintNode.',
    stack: ['Power Automate', 'Sage Accounting API', 'PrintNode API', 'REST', 'JSON'],
    year: '2026',
    badge: 'Architecture walkthrough',
    category: 'professional',
    context: 'Virtumed (Pty) Ltd',
    case: {
      problem:
        'Delivery information started in the operational system but had to end up in the accounting system and on paper. Re-entering the same delivery details by hand and then printing the document manually is slow and easy to get wrong.',
      built:
        'An integration that takes delivery note information from the operational system, sends it to Sage Accounting through its API using Power Automate, and then sends the resulting document to PrintNode so it prints at the correct physical printer without anyone re-typing it.',
      technology: 'Power Automate, the Sage Accounting API, the PrintNode API, REST calls and JSON payloads.',
      ownership:
        'I built the integration end to end: the Power Automate flows, the API calls and payload shaping between the operational system and Sage Accounting, the document handling, and the PrintNode step that puts the delivery note on paper.',
      outcome:
        'Delivery information moves from operational activity into the financial process and out to printed documentation in one automated path, instead of being captured a second time by hand.',
      sanitised:
        'The diagram and the JSON examples on this page are fabricated. The references, item codes, serial numbers and printer identifiers are invented. No real endpoints, credentials, tenant identifiers, customer records or company financial information appear anywhere.',
    },
    display: {
      kind: 'flow',
      stages: [
        {
          name: 'Operational system',
          role: 'A delivery is captured against stock in the internal system.',
          detail: ['Dataverse', 'Stock movement'],
        },
        {
          name: 'Power Automate',
          role: 'Picks up the delivery, shapes the payload and orchestrates the calls.',
          detail: ['Trigger', 'Validation', 'Error handling'],
        },
        {
          name: 'Sage Accounting API',
          role: 'Receives the delivery note so the transaction exists in the financial system.',
          detail: ['REST', 'JSON'],
        },
        {
          name: 'Document processing',
          role: 'The document is produced and prepared for printing.',
          detail: ['Delivery note', 'PDF'],
        },
        {
          name: 'PrintNode API',
          role: 'Sends the document to the correct physical printer.',
          detail: ['Print job', 'Printer routing'],
        },
        {
          name: 'Printed delivery documentation',
          role: 'The delivery note comes off the printer, ready to go out with the stock.',
        },
      ],
      payload: {
        title: 'Example payloads',
        note: 'Fabricated for this page. Not real endpoints, references or credentials.',
        code: `// 1. Delivery note posted to the accounting API
{
  "reference": "DN-DEMO-004182",
  "date": "2026-03-04",
  "customer_ref": "CUST-DEMO-118",
  "lines": [
    {
      "item_ref": "ITEM-DEMO-2210",
      "description": "Delivery catheter 6F",
      "quantity": 2,
      "serials": ["SN-DEMO-000481", "SN-DEMO-000482"]
    }
  ]
}

// 2. Print job sent to the print API
{
  "printerId": 000000,
  "title": "Delivery note DN-DEMO-004182",
  "contentType": "pdf_base64",
  "content": "<document>",
  "source": "Power Automate"
}`,
      },
    },
  },
  {
    id: 'secure-internal-tools',
    title: 'Secure Internal Operations Tools',
    summary:
      'Internal web pages for stock movement, receiving and business workflows, published behind Cloudflare Access and Microsoft Entra.',
    stack: ['HTML', 'Cloudflare Access', 'Cloudflare Zero Trust', 'Microsoft Entra ID', 'Dataverse'],
    year: '2026',
    badge: 'Architecture walkthrough',
    category: 'professional',
    context: 'Virtumed (Pty) Ltd',
    case: {
      problem:
        'Some operational tasks needed a simple internal page rather than a full application, but anything reachable on the internet had to be restricted to staff and tied to their existing company identity rather than a separate password.',
      built:
        'Internal operational pages supporting areas such as stock movement, receiving and business workflows, published behind Cloudflare Access and Cloudflare Zero Trust with Microsoft Entra authentication in front of them, reading from and writing back to the business systems.',
      technology: 'HTML, Cloudflare Access, Cloudflare Zero Trust, Microsoft Entra authentication, Dataverse and related business systems.',
      ownership: 'I built the pages and set up the access path in front of them, then tested, deployed and supported them.',
      outcome:
        'The pages are reachable only through company identity, so staff sign in with the account they already have and unauthenticated traffic never reaches the application.',
      sanitised:
        'Only the access architecture is shown. No internal page, screen, endpoint, tenant identifier or configuration value from the real environment appears anywhere on this site.',
    },
    display: {
      kind: 'flow',
      stages: [
        { name: 'User', role: 'A staff member opens the internal page in a browser.' },
        {
          name: 'Cloudflare Access',
          role: 'Sits in front of the application and blocks anything that is not authenticated.',
          detail: ['Zero Trust policy'],
        },
        {
          name: 'Microsoft Entra authentication',
          role: 'Identity is confirmed against the existing company directory.',
          detail: ['Entra ID sign-in'],
        },
        {
          name: 'Internal application',
          role: 'The operational page loads once the request is authenticated.',
          detail: ['HTML', 'Stock movement', 'Receiving'],
        },
        {
          name: 'Business systems',
          role: 'The page reads from and writes to the systems that hold the operational data.',
          detail: ['Dataverse'],
        },
      ],
    },
  },
  {
    id: 'cross-site-broadcast',
    title: 'Cross Site Medical Broadcast',
    summary:
      'Low latency audiovisual communication between doctors at separate clinical sites during medical cases.',
    stack: ['Peplink', 'AWS', 'vMix', 'NDI', 'PTZ cameras', 'Networking'],
    year: '2025',
    badge: 'Technical case study',
    category: 'professional',
    context: 'Virtumed (Pty) Ltd',
    case: {
      problem:
        'Doctors at geographically separate clinical sites needed to see and speak to each other in real time during medical cases. A normal video call is not good enough for that: the delay, the picture quality and the audio reliability all matter, and the link has to hold up on site rather than in a lab.',
      built:
        'A cross site broadcast setup. Cameras and audio at each site feed a vMix production system, video moves between sources over NDI, bonded connectivity carries the link between sites with AWS infrastructure in the path, and intercom equipment handles talkback between the teams. The sessions are recorded.',
      technology:
        'Peplink, AWS infrastructure, vMix, NDI, audio systems, PTZ cameras, communications and intercom equipment, networking, recording and broadcast hardware.',
      ownership:
        'I researched the approach and implemented it: the equipment and vendor evaluation, the network and infrastructure setup, the vMix and NDI configuration, the camera and audio setup, the intercom path, recording, system testing and event preparation. My responsibility was the technical delivery of the link. I had no part in any clinical decision, and this was not medical software development.',
      outcome:
        'Doctors at separate sites could see and hear each other in real time during cases, with the sessions recorded, and the setup was tested and prepared ahead of each event rather than configured on the day.',
      sanitised:
        'Only the technical signal path is shown. No clinical footage, patient information, hospital name, site address or network configuration detail appears anywhere on this site.',
    },
    display: {
      kind: 'flow',
      stages: [
        {
          name: 'Site A capture',
          role: 'PTZ cameras and audio capture the room and the procedure feed.',
          detail: ['PTZ cameras', 'Audio systems'],
        },
        {
          name: 'vMix production',
          role: 'Sources are switched and mixed into the outgoing programme feed.',
          detail: ['vMix', 'NDI'],
        },
        {
          name: 'Bonded connectivity',
          role: 'Peplink carries the link out of site so a single connection failing does not drop the session.',
          detail: ['Peplink', 'Networking'],
        },
        {
          name: 'AWS infrastructure',
          role: 'Cloud infrastructure in the path between the two sites.',
          detail: ['Transport'],
        },
        {
          name: 'Site B',
          role: 'The feed is received and displayed for the doctors at the second site.',
          detail: ['vMix', 'Displays'],
        },
        {
          name: 'Talkback and recording',
          role: 'Intercom carries two way communication between the teams, and the session is recorded.',
          detail: ['Intercom', 'Recording'],
        },
      ],
    },
  },
  {
    id: 'portfolio-site',
    title: 'This Portfolio',
    summary: 'A Next.js portfolio with a WebGL hero and the interactive case study panels on this page.',
    stack: ['Next.js', 'React', 'TypeScript', 'Three.js', 'CSS Modules'],
    year: '2026',
    badge: 'Live demo',
    category: 'personal',
    case: {
      problem:
        'A CV lists what someone has done but does not show how they build. I wanted the site itself to be a working example rather than a static page, and I wanted the professional case studies to be explorable instead of only described.',
      built:
        'This site. A Next.js App Router build with a WebGL hero, an accessible card and modal system for the case studies, and the interactive reconstructions used in the professional projects above, all driven from typed data files so the content can change without touching layout.',
      technology: 'Next.js, React, TypeScript, Three.js through react-three-fiber, and CSS Modules.',
      ownership: 'I built all of it, including the 3D hero, the interactive panels and the content architecture behind them.',
      outcome:
        'A responsive site that works without JavaScript-heavy interaction, falls back cleanly on small screens and for reduced motion, and doubles as the demonstration of the personal development work it describes.',
      sanitised: 'Nothing. This is a personal project and everything here is my own work.',
    },
    links: { live: '/', repo: 'https://github.com/KaydenPellegrini' },
    display: { kind: 'embed', url: '/', title: 'kayden.co.za' },
  },
  {
    id: 'home-automation',
    title: 'Custom Home Assistant',
    summary: 'A home assistant of my own that uses several APIs to control most of the house.',
    stack: ['APIs', 'Integrations', 'Home automation'],
    year: '2024 to present',
    badge: 'Personal project',
    category: 'personal',
    case: {
      problem:
        'Different parts of the house are run by different services, each with its own API and its own way of being controlled. Nothing joined them up, so anything involving more than one of them had to be done by hand.',
      built:
        'A custom home assistant that talks to those APIs and controls most of the house from one place, so automation happens at home rather than only at work.',
      technology: 'Several device and service APIs, brought together in one application.',
      ownership: 'All of it. It is a personal project I have been building and extending since 2024.',
      outcome:
        'It runs at home and covers most of the house. It is still growing as I add more of the systems around it.',
      sanitised:
        'Nothing about the setup is published here. No network detail, device identifier, credential, API key or configuration from my home appears anywhere on this site.',
    },
    display: { kind: 'none' },
  },
  {
    id: 'escape-room-ops',
    title: 'Escape Room Ops Board',
    summary: 'A personal concept for a live room status board, drawn from managing escape rooms.',
    stack: ['React', 'TypeScript', 'Vite', 'CSS'],
    year: '2021',
    badge: 'Personal concept',
    category: 'personal',
    case: {
      problem:
        'Running several escape rooms at once meant tracking bookings, resets and technical faults from memory and a paper diary during the busiest hours of the night.',
      built:
        'A design concept for an operations board where each room is a tile showing the current session, time remaining, reset state and any fault that has been flagged.',
      technology: 'React, TypeScript, Vite and CSS.',
      ownership: 'The concept and the design are mine, based on the four years I spent managing the rooms.',
      outcome:
        'A personal concept rather than a deployed system. It is included because the problem it addresses comes from real operational experience.',
      sanitised:
        'This is a concept and a personal reconstruction. It was never built for or used by an employer, and the screens shown are mockups with invented bookings and room names.',
    },
    display: {
      kind: 'case',
      gallery: ['/showcase/ops-board-1.svg', '/showcase/ops-board-2.svg', '/showcase/ops-board-3.svg'],
    },
  },
]

export const openSourceProjects = showcaseProjects.filter((project) => project.category === 'open-source')
export const professionalProjects = showcaseProjects.filter((project) => project.category === 'professional')
export const personalProjects = showcaseProjects.filter((project) => project.category === 'personal')
