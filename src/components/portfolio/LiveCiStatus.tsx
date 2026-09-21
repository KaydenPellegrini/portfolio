import { CI_REPO, getCiStatus } from '@/lib/githubCiStatus'
import styles from '@/app/page.module.css'

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Johannesburg',
  }).format(new Date(iso))

const repoName = CI_REPO.split('/')[1]

/** Shown while the status is being fetched. Claims nothing. */
export function CiStatusPending() {
  return (
    <p className={styles.ciStatus}>
      <span className={`${styles.ciChip} ${styles.ciNeutral}`}>CI_CHECKING</span>
      <span className={styles.ciText}>Checking {repoName} on GitHub Actions</span>
    </p>
  )
}

/**
 * The one status chip that is a claim rather than decoration, so it is fetched
 * live and says where it came from. See src/lib/githubCiStatus.ts for the rules.
 */
export default async function LiveCiStatus() {
  const status = await getCiStatus()

  if (status.state === 'unavailable') {
    return (
      <p className={styles.ciStatus}>
        <span className={`${styles.ciChip} ${styles.ciNeutral}`}>CI_UNKNOWN</span>
        <span className={styles.ciText}>
          GitHub Actions did not answer, so no build status is shown for{' '}
          <a href={`https://github.com/${CI_REPO}`} target="_blank" rel="noopener noreferrer">
            {repoName}
          </a>
          .
        </span>
      </p>
    )
  }

  const passing = status.state === 'passing'
  return (
    <p className={styles.ciStatus}>
      <a
        className={`${styles.ciChip} ${passing ? styles.ciPassing : styles.ciFailing}`}
        href={status.runUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {passing ? 'CI_PASSING' : 'CI_FAILING'}
      </a>
      <span className={styles.ciText}>
        {repoName}: {status.workflow} on {status.branch} {passing ? 'passed' : 'failed'} at commit{' '}
        {status.commit}, {formatDate(status.finishedAt)}.{' '}
        <span className={styles.ciSource}>Live from GitHub Actions.</span>
      </span>
    </p>
  )
}
