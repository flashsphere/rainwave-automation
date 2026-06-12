import styles from './RuleListItem.module.css'
import { DragHandle } from '@/components/SortableItem'
import {
  operatorLabels,
  type RatingCondition,
  type RequestCondition,
  type Rule,
} from '@/utils/rule'

type RuleListItemProps = {
  rule: Rule
  index: number
  showDragHandle?: boolean
  handleMoveUp?: (index: number) => void
  handleMoveDown?: (index: number) => void
  handleEdit: (rule: Rule) => void
  handleDelete: (index: number) => void
}

export function RuleListItem({ rule, index, ...props }: RuleListItemProps) {
  const showDragHandle = props.showDragHandle ?? true

  const renderRequest = (c: RequestCondition) => {
    switch (c.requestType) {
      case 'User':
        return <span>Your song request</span>
      case 'Others':
        return <span>Others' song request</span>
    }
  }

  const renderRating = (c: RatingCondition) => (
    <span>
      Song rating {operatorLabels[c.operator]} {c.rating}
    </span>
  )

  const renderFaveSong = () => <span>Favorite song</span>

  const renderFaveAlbum = () => <span>Favorite album</span>

  const handleMoveUp = () => {
    props.handleMoveUp?.(index)
  }

  const handleMoveDown = () => {
    props.handleMoveDown?.(index)
  }

  const handleEdit = () => {
    props.handleEdit(rule)
  }

  const handleDelete = () => {
    props.handleDelete(index)
  }

  return (
    <div key={rule.id} className={styles.ruleItem}>
      {showDragHandle && <DragHandle />}
      {!showDragHandle && (
        <div className={styles.actionIcons}>
          <button onClick={handleMoveUp}>⬆️</button>
          <button onClick={handleMoveDown}>⬇️</button>
        </div>
      )}
      <div className={styles.ruleContent}>
        <div className={styles.ruleNumber}>{index + 1}.</div>
        <div>
          {rule.conditions.map((c, ci) => (
            <div key={c.id}>
              {c.type === 'Request' && renderRequest(c)}
              {c.type === 'Rating' && renderRating(c)}
              {c.type === 'FaveSong' && renderFaveSong()}
              {c.type === 'FaveAlbum' && renderFaveAlbum()}
              {ci < rule.conditions.length - 1 && <span> and </span>}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.actionIcons}>
        <button onClick={handleEdit}>🖊️</button>
        <button onClick={handleDelete}>❌</button>
      </div>
    </div>
  )
}
