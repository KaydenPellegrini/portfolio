---
name: review
description: Review HTML page quality. Use when the user asks to review, check, or QA an HTML file or all pages. Pass a filename as an argument (e.g. /review about.html) or no argument to review all pages.
allowed-tools: Read, Bash(find *), Bash(cat *)
model: sonnet
---

# HTML review skill

Review the HTML file(s) provided. If `$ARGUMENTS` is empty, find and review all `.html` files in the project root.

## Check each file for

**Structure**
- Has `<!DOCTYPE html>`
- Has `<html lang="...">` with language set
- Has unique, descriptive `<title>` tag
- Has `<meta charset="UTF-8">` and `<meta name="viewport" ...>`
- Has logical heading hierarchy (one `<h1>`, `<h2>` before `<h3>`, etc.)

**Semantics**
- Uses semantic elements: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`
- No `<div>` used where a semantic element would be more appropriate
- Links use `<a href="...">` with descriptive text (not "click here")

**Accessibility**
- All `<img>` tags have `alt` attributes (non-empty for meaningful images, `alt=""` for decorative)
- Form inputs have associated `<label>` elements
- Navigation uses `<nav>` and has an `aria-label` if there are multiple navs

**Consistency**
- Nav markup matches across all pages
- CSS link path is consistent: `assets/css/styles.css`
- JS script path is consistent if present

**Assets**
- No linked CSS or JS files with uppercase or underscore names
- No broken-looking relative paths

## Output format

For each file reviewed:

### `filename.html`
- ✅ Pass items (brief)
- ⚠️ Issues found (specific line or element, what's wrong, how to fix)

End with a summary: "X files reviewed. Y issues found across Z files."
