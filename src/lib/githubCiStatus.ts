/**
 * Live CI status for the public dbt project, read from the GitHub Actions API.
 *
 * The status chip on the home page is a claim, so it has to be earned on every
 * render rather than typed in once. Rules:
 *
 *   - Only a completed run on main counts. A run in progress says nothing yet.
 *   - "passing" is shown only for conclusion "success". Anything the API cannot
 *     confirm is reported as unavailable, never as green.
 *   - Responses are cached for 15 minutes. Next only writes 200 responses to the
 *     cache, so a rate limited or failed call can never replace a real result
 *     with a wrong one, and a cold failure shows as unavailable.
 *   - No token is used. Unauthenticated access is enough for a public repo's run
 *     conclusions, and it keeps a secret out of the deployment.
 */

export const CI_REPO = 'KaydenPellegrini/serial-margin-dbt'
/** Where the chip sends a visitor to check the runs for themselves. */
export const CI_ACTIONS_URL = `https://github.com/${CI_REPO}/actions`
const WORKFLOW_FILE = 'dbt.yml'
const BRANCH = 'main'

export type CiStatus =
  | {
      state: 'passing' | 'failing'
      repo: string
      workflow: string
      branch: string
      /** ISO timestamp of when the run finished. */
      finishedAt: string
      commit: string
    }
  | { state: 'unavailable'; repo: string }

type WorkflowRunsResponse = {
  workflow_runs?: Array<{
    name?: string
    conclusion?: string | null
    head_branch?: string
    head_sha?: string
    updated_at?: string
  }>
}

export async function getCiStatus(): Promise<CiStatus> {
  const unavailable: CiStatus = { state: 'unavailable', repo: CI_REPO }
  try {
    const response = await fetch(
      `https://api.github.com/repos/${CI_REPO}/actions/workflows/${WORKFLOW_FILE}/runs?branch=${BRANCH}&status=completed&per_page=1`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'kayden.co.za',
        },
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(4000),
      },
    )
    if (!response.ok) return unavailable

    const run = ((await response.json()) as WorkflowRunsResponse).workflow_runs?.[0]
    if (!run?.conclusion || !run.updated_at || !run.head_sha) return unavailable

    const state = run.conclusion === 'success' ? 'passing' : run.conclusion === 'failure' ? 'failing' : null
    if (!state) return unavailable

    return {
      state,
      repo: CI_REPO,
      workflow: run.name ?? 'CI',
      branch: run.head_branch ?? BRANCH,
      finishedAt: run.updated_at,
      commit: run.head_sha.slice(0, 7),
    }
  } catch {
    return unavailable
  }
}
