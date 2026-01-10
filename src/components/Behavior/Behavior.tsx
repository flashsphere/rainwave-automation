import type { BehaviorSettings } from '@/utils/settings'
import styles from './Behavior.module.css'

type BehaviorProps = {
  behavior: BehaviorSettings
  save: (behavior: BehaviorSettings) => void
}

export function Behavior({ behavior, save }: BehaviorProps) {
  const handlePlayingOnWebsite = (e: React.ChangeEvent<HTMLInputElement>) => {
    save({
      ...behavior,
      playingOnWebsite: e.currentTarget.checked,
    })
  }

  return (
    <div>
      <h2>Automation Behavior</h2>
      <div className={styles.behaviorItem}>
        <div className={styles.behaviorInput}>
          <input
            type="checkbox"
            id="playing-on-website"
            checked={behavior.playingOnWebsite}
            onChange={handlePlayingOnWebsite}
          />
        </div>
        <div>
          <label htmlFor="playing-on-website">Run only when playing on website</label>
        </div>
      </div>
    </div>
  )
}
