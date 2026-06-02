---
name: audit-structure
description: Audit the project folder structure and file naming conventions. Use when the user asks to check, audit, scan, or review the project structure or naming. Triggers on phrases like "audit the project", "check naming", "what files need renaming", "structure issues".
allowed-tools: Read, Bash(find *), Bash(ls *)
model: opus
---

# Audit structure skill

You are auditing a multi-page HTML website project. Use `find` and `ls` to scan the entire project directory.

## Steps

1. Run `find . -not -path '*/.git/*' -not -path '*/.claude/*' -not -path '*/node_modules/*'` to list all files
2. Check each file and folder name against these rules:
   - All names must be lowercase
   - Words separated by hyphens only (no underscores, no spaces, no camelCase)
   - HTML files: `page-name.html`
   - CSS files: inside `assets/css/`, named `styles.css` or `page-name.css`
   - JS files: inside `assets/js/`, named `main.js` or `page-name.js`
   - Images: inside `assets/images/`, named `category-description.ext`
3. Check the folder structure matches the expected layout in CLAUDE.md
4. Check for any HTML files in wrong locations (e.g. in subdirectories when they should be at root, or vice versa)

## Output format

Produce a report in this format:

### ✅ Correct
List files/folders that comply.

### ⚠️ Naming violations
| Current name | Should be | Reason |
|---|---|---|

### 📁 Structure issues
List any folders missing, misplaced, or incorrectly named.

### 🔧 Recommended actions
Numbered list of specific actions to fix issues, in priority order.

End with: "Run `/rename-files` to apply the naming fixes, or tell me which items to fix first."
