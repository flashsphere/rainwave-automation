import { useState, useRef } from 'react'
import styles from './RuleForm.module.css'
import {
  conditionTypes,
  conditionLabels,
  requestTypeLabels,
  operatorLabels,
  type Condition,
  type ConditionType,
  type Rule,
  type RequestType,
  type Operator,
} from '@/utils/rule'

interface RuleFormProps {
  rule?: Rule
  save: (updatedRule: Rule) => void
  cancel: () => void
}

const createCondition = (id: string, type: ConditionType): Condition => {
  switch (type) {
    case 'Request':
      return { id, type, requestType: 'User' }
    case 'Rating':
      return { id, type, operator: 'GreaterEqual', rating: 0 }
    case 'FaveSong':
      return { id, type }
    case 'FaveAlbum':
      return { id, type }
  }
}

export function RuleForm({ rule, save, cancel }: RuleFormProps) {
  const [conditions, setConditions] = useState<Condition[]>(
    rule ? rule.conditions : [createCondition(crypto.randomUUID(), conditionTypes[0])],
  )

  const ratingRef = useRef<HTMLInputElement>(null)

  const onRatingFocus = () => {
    ratingRef.current?.select()
  }

  const conditionOptions = conditionTypes.map((value) => ({
    value,
    label: conditionLabels[value],
  }))

  const conditionTypesToShow = (type: ConditionType) => {
    return conditionOptions.filter(
      (c) => c.value === type || !conditions.map((cond) => cond.type).includes(c.value),
    )
  }

  const onConditionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    const newType = e.currentTarget.value as ConditionType

    setConditions((prev) => {
      const existingCondition = prev[index]
      const newConditions = [...prev]
      newConditions[index] = createCondition(existingCondition.id, newType)
      return newConditions
    })
  }

  const onRequestTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    const newType = e.currentTarget.value as RequestType

    setConditions((prev) => {
      const existingCondition = prev[index]
      const newConditions = [...prev]
      if (existingCondition.type === 'Request') {
        newConditions[index] = {
          ...existingCondition,
          requestType: newType,
        }
      }
      return newConditions
    })
  }

  const onOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    const newOperator = e.currentTarget.value as Operator

    setConditions((prev) => {
      const existingCondition = prev[index]
      const newConditions = [...prev]
      if (existingCondition.type === 'Rating') {
        newConditions[index] = {
          ...existingCondition,
          operator: newOperator,
        }
      }
      return newConditions
    })
  }

  const onRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    const newRating = Number(e.currentTarget.value)
    if (Number.isNaN(newRating)) {
      return
    }

    setConditions((prev) => {
      const existingCondition = prev[index]
      const newConditions = [...prev]
      if (existingCondition.type === 'Rating') {
        newConditions[index] = {
          ...existingCondition,
          rating: newRating,
        }
      }
      return newConditions
    })
  }

  const addCondition = () => {
    if (conditions.length >= conditionTypes.length) return

    const availableType = conditionTypes.find(
      (c) => !conditions.map((cond) => cond.type).includes(c),
    )
    if (!availableType) return

    setConditions((prev) => [...prev, createCondition(crypto.randomUUID(), availableType)])
  }

  const removeCondition = (e: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(e.currentTarget.dataset.index)
    setConditions((prev) => {
      const newConditions = [...prev]
      newConditions.splice(index, 1)
      return newConditions
    })
  }

  const saveRule = () => {
    let updatedRule: Rule
    if (rule != null) {
      updatedRule = {
        ...rule,
        conditions,
      }
    } else {
      updatedRule = {
        id: crypto.randomUUID(),
        conditions,
      }
    }
    save(updatedRule)
  }

  return (
    <div className={styles.ruleForm}>
      {conditions.map((c, i) => (
        <>
          <div key={c.id} className={styles.condition}>
            <button className={styles.button} data-index={i} onClick={removeCondition}>
              ✕
            </button>

            <div className={styles.ruleInput}>
              <div className={styles.conditionTypeInput}>
                <select value={c.type} data-index={i} onChange={onConditionChange}>
                  {conditionTypesToShow(c.type).map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {c.type === 'Request' && (
                <div className={styles.requestInput}>
                  {Object.entries(requestTypeLabels).map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="requestType"
                        value={value}
                        checked={c.requestType === value}
                        data-index={i}
                        onChange={onRequestTypeChange}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
              {c.type === 'Rating' && (
                <div className={styles.ratingInput}>
                  <select value={c.operator} data-index={i} onChange={onOperatorChange}>
                    {Object.entries(operatorLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  &nbsp;
                  <input
                    ref={ratingRef}
                    type="number"
                    value={c.rating}
                    size={3}
                    min={0}
                    max={5}
                    data-index={i}
                    onInput={onRatingChange}
                    onFocus={onRatingFocus}
                  />
                </div>
              )}
            </div>
          </div>
          {i < conditions.length - 1 && <div className={styles.and}>and</div>}
        </>
      ))}
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.button}
          onClick={addCondition}
          disabled={conditions.length >= conditionTypes.length}
        >
          +
        </button>
        &nbsp;
        <button type="button" className={styles.button} onClick={cancel}>
          Cancel
        </button>
        &nbsp;
        <button
          type="button"
          className={styles.button}
          onClick={saveRule}
          disabled={conditions.length == 0}
        >
          Save
        </button>
      </div>
    </div>
  )
}
