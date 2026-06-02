---
name: rename-files
description: Apply file and folder naming convention fixes to the project. Use after running audit-structure, or when the user says "rename files", "fix naming", "apply naming conventions". Always shows a plan first and waits for approval before making any changes.
allowed-tools: Read, Write, Bash(find *), Bash(mv *), Bash(ls *), Bash(grep *)
model: opus
---

# Rename files skill

You are fixing file and folder naming conventions in a multi-page HTML website project.

## Rules
- Lowercase only
- Hyphens between words (kebab-case)
- No underscores, spaces, or camelCase

## Step 1 — Produce the rename plan

Scan the project with `find` and generate a table showing every rename needed:

| # | Current path | New path |
|---|---|---|

Then say: **"Here is the rename plan. Reply 'go ahead' to apply all changes, or tell me which numbers to skip."**

STOP HERE and wait for user confirmation before doing anything.

## Step 2 — Apply renames (only after approval)

For each rename:
1. Use `mv old-path new-path` via Bash
2. After renaming HTML files: run `grep -rl "old-filename" .` to find any internal links that reference the old name, and update them automatically
3. After renaming CSS/JS files: update any `<link>` or `<script>` `src` references in HTML files

## Step 3 — Verify

Run `find` again and confirm all files now comply with naming rules.

Report: "✅ Renamed X files. Updated Y internal references. All names now comply."
