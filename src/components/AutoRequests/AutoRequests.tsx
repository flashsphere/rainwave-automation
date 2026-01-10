import styles from './AutoRequests.module.css'
import type { AutoRequestSettings } from '@/utils/settings'

type AutoRequestsProps = {
  autoRequests: AutoRequestSettings
  save: (autoRequests: AutoRequestSettings) => void
}

export function AutoRequests({ autoRequests, save }: AutoRequestsProps) {
  const handleFave = (e: React.ChangeEvent<HTMLInputElement>) => {
    save({
      ...autoRequests,
      fave: e.currentTarget.checked,
    })
  }

  const handleUnrated = (e: React.ChangeEvent<HTMLInputElement>) => {
    save({
      ...autoRequests,
      unrated: e.currentTarget.checked,
    })
  }

  const handleClear = (e: React.ChangeEvent<HTMLInputElement>) => {
    save({
      ...autoRequests,
      clear: e.currentTarget.checked,
    })
  }

  return (
    <div>
      <h2>Automatic song requests</h2>
      <div className={styles.autoRequestItem}>
        <div className={styles.autoRequestInput}>
          <input
            type="checkbox"
            id="auto-request-fave"
            checked={autoRequests.fave}
            onChange={handleFave}
          />
        </div>
        <div>
          <label htmlFor="auto-request-fave">
            Request favorites <br />
            <span className={styles.autoRequestDesc}>
              Automatically request favorite songs when tuned-in and your request queue is empty or
              on cooldown.
            </span>
          </label>
        </div>
      </div>
      <div className={styles.autoRequestItem}>
        <div className={styles.autoRequestInput}>
          <input
            type="checkbox"
            id="auto-request-unrated"
            checked={autoRequests.unrated}
            onChange={handleUnrated}
          />
        </div>
        <div>
          <label htmlFor="auto-request-unrated">
            Request unrated <br />
            <span className={styles.autoRequestDesc}>
              Automatically request unrated songs when tuned-in and your request queue is empty or
              on cooldown.
              <br />
              "Request favorites" will take precedence if it is enabled.
            </span>
          </label>
        </div>
      </div>
      <div className={styles.autoRequestItem}>
        <div className={styles.autoRequestInput}>
          <input
            type="checkbox"
            id="auto-request-clear"
            checked={autoRequests.clear}
            onChange={handleClear}
          />
        </div>
        <div>
          <label htmlFor="auto-request-clear">
            Delete requests on cooldown <br />
            <span className={styles.autoRequestDesc}>
              Automatically delete requests that are on cooldown and of another station before
              requesting the above.
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
