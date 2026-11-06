# Kayden Pellegrini | Portfolio

Personal portfolio for my work in data engineering, Power Platform, AI systems and hardware integration. The site brings together technical case studies, interactive demonstrations and public repositories, with a focus on the problem, what I built and the result.

**[Visit the portfolio](https://www.kayden.co.za)** · **[Explore the Build Lab](https://www.kayden.co.za/showcase)** · **[Download my CV](https://www.kayden.co.za/Kayden-Pellegrini-CV-2026.pdf)**

## Explore the site

| Area | What you will find |
| --- | --- |
| [Portfolio](https://www.kayden.co.za) | Selected work, technical case studies, experience and contact details. |
| [Build Lab](https://www.kayden.co.za/showcase) | Interactive RFID and BI reconstructions, architecture walkthroughs, public projects and personal builds. |
| [Fire Control](https://www.kayden.co.za/fire-control) | A Hell Let Loose artillery tool with tactical maps, gun placement, and distance, azimuth and elevation calculations. Also covers self-propelled guns, grid callouts, shareable fire missions and a flight-time timer. |

## Featured work

The portfolio covers the systems I build and the decisions behind them:

- **Data engineering:** landed cost and gross margin per serialised unit, purchase reconciliation and data quality checks.
- **Power Platform and BI:** operational applications, RFID stocktaking, Dataverse models and Power BI reporting.
- **AI systems:** Model Context Protocol integrations and verification workflows that check claimed changes against evidence.
- **Integration and infrastructure:** Sage Accounting and PrintNode automation, internal tools behind company identity, and audiovisual links between sites.

Professional case studies explain my contribution and the approach. Interactive reconstructions use synthetic data; employer applications and operational records are not published here.

## Public repositories

These projects have their own source repositories. This repository contains the portfolio website that presents them.

| Project | Focus |
| --- | --- |
| [serial-margin-dbt](https://github.com/KaydenPellegrini/serial-margin-dbt) | Serial-level margin and purchase reconciliation using dbt, DuckDB, SQL and synthetic data, with deliberately planted data defects and automated checks. |
| [readiness-audits](https://github.com/KaydenPellegrini/readiness-audits) | Claude Code audit skills using independent review passes and an adjudicator to verify claimed fixes against the actual diff. |

## Website stack

- **Next.js App Router, React and TypeScript** for the application.
- **Three.js and React Three Fiber** for the WebGL hero.
- **CSS Modules and Tailwind CSS** for styling.
- **Vercel Analytics** for site analytics.

The technologies discussed in the case studies describe those projects. They are not all dependencies of this website.

## Run locally

With Node.js and npm installed:

```bash
git clone https://github.com/KaydenPellegrini/portfolio.git
cd portfolio
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

To build and serve the production version:

```bash
npm run build
npm start
```

## Content and maintenance

Page content is kept in typed data files, so wording and projects can be updated separately from layout.

| Location | Purpose |
| --- | --- |
| `src/data/site/home.ts` | Home page narrative, case studies and selected work. |
| `src/data/site/snippets.ts` | Code excerpts used on the home page. |
| `src/data/showcase/projects.ts` | Build Lab projects, case studies and display modes. |
| `src/data/showcase/rfidDemo.ts` | Synthetic data for the RFID reconstruction. |
| `src/data/showcase/biDemo.ts` | Synthetic data for the BI reconstruction. |
| `src/data/cv/profile.ts` | Shared profile facts and CV wording. |
| `public/Kayden-Pellegrini-CV-2026.pdf` | The downloadable CV. |
| `public/fire-control/` | The standalone Fire Control tool and its assets. |
| `scripts/generate-cv.mjs` | Optional PDF generation from the CV data. |

<details>
<summary><strong>Regenerating the CV</strong></summary>

<br>

The published CV is a supplied PDF. To generate a replacement from `src/data/cv/profile.ts`:

```bash
npm run cv
```

This overwrites `public/Kayden-Pellegrini-CV-2026.pdf`. Keep the supplied PDF and the wording in `profile.ts` aligned when updating either one.

The generator uses Calibri from the Windows fonts folder. On systems without Calibri, set `CV_FONT_REGULAR` and `CV_FONT_BOLD` to paths for a compatible font such as Carlito. The generator does not silently substitute another font.

</details>

## Contact

[Contact section](https://www.kayden.co.za/#contact) · [LinkedIn](https://linkedin.com/in/kaydenpellegrini) · [GitHub](https://github.com/KaydenPellegrini)
