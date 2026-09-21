/**
 * Code shown on the home page, copied verbatim from the public repositories.
 *
 * Each snippet is pinned to a commit, so the lines shown and the lines linked on
 * GitHub are always the same lines. To refresh one, copy the new lines from the
 * repository and update the commit hash with them. Never edit the code here by
 * hand: a snippet that does not match the linked file is exactly the kind of
 * claim this site is meant not to make.
 */

import type { Snippet } from '@/components/portfolio/CodeSnippet'

export const fanoutTest: Snippet = {
  repo: "KaydenPellegrini/serial-margin-dbt",
  commit: "0f8f395b7974c1e354a37daf01634b2c2c12fe2b",
  path: "tests/assert_no_fanout_on_serial_join.sql",
  startLine: 8,
  language: "sql",
  code: "with fact as (\n    select count(*) as row_count, count(distinct serial_number) as serial_count\n    from {{ ref('fct_serial_margin') }}\n)\n\nselect *\nfrom fact\nwhere row_count <> serial_count"
}

export const creditNotesTest: Snippet = {
  repo: "KaydenPellegrini/serial-margin-dbt",
  commit: "0f8f395b7974c1e354a37daf01634b2c2c12fe2b",
  path: "tests/assert_credit_notes_are_netted.sql",
  startLine: 5,
  language: "sql",
  code: "select\n    serial_number,\n    net_quantity,\n    is_fully_credited,\n    is_margin_reliable\nfrom {{ ref('fct_serial_margin') }}\nwhere is_fully_credited\n  and (net_quantity > 0 or is_margin_reliable = true)"
}

export const adjudicatorContract: Snippet = {
  repo: "KaydenPellegrini/readiness-audits",
  commit: "3ddcac92d64388dff92ebaeff13ae983260ee556",
  path: "agent-readiness-audit/references/agent-roles.md",
  startLine: 99,
  language: "markdown",
  code: "> **For every claimed fix in the report**, locate the corresponding change in the real diff and assign a verdict:\n> `VERIFIED`, `OVERCLAIM`, `HALLUCINATED`, `COSMETIC`, `REGRESSION`, `SCOPE-CREEP`, or `UNRESOLVED-OK` (see the\n> taxonomy for detection method + examples). For each, cite the diff hunk (or its absence) that justifies the\n> verdict, and give the corrected confidence.\n>\n> **Also independently check the whole, not just the parts:**\n> - Did fixing one trifecta leg reopen another? (Cross-section: e.g. §2.4 egress tightened but §3.1 still feeds\n>   untrusted content into a data-bearing context with another exfil path.)\n> - Did the test pass-rate drop vs baseline? Any new failure is a `REGRESSION` regardless of what the report says.\n> - Are any `Verified` labels unsupported by the diff? Downgrade them and mark `OVERCLAIM`/`HALLUCINATED`."
}
