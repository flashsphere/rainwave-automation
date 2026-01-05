import { useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { Rule } from '@/utils/rule'
import { Modal } from '@/components/Modal'
import { RuleList } from './RuleList'
import { RuleForm } from './RuleForm'

type RulesProps = {
  rules: Rule[]
  save: (rule: Rule[]) => void
}

export function Rules({ rules, save }: RulesProps) {
  const [addModal, setAddModal] = useState(false)
  const [editRuleModal, setEditRuleModal] = useState<Rule | null>(null)

  const handleCloseAddModal = () => setAddModal(false)
  const handleCloseEditModal = () => setEditRuleModal(null)

  const handleAdd = () => setAddModal(true)

  const addRule = (rule: Rule) => {
    save([...rules, rule])
    handleCloseAddModal()
  }

  const editRule = (rule: Rule) => {
    setEditRuleModal(rule)
  }

  const updateRule = (rule: Rule) => {
    const index = rules.findIndex((r) => r.id === rule.id)
    if (index > -1 && index < rules.length) {
      const newRules = [...rules]
      newRules[index] = rule
      save(newRules)
    }
    handleCloseEditModal()
  }

  const deleteRule = (index: number) => {
    const newRules = [...rules]
    newRules.splice(index, 1)
    save(newRules)
  }

  const reorderRules = (oldIndex: number, newIndex: number) => {
    save(arrayMove(rules, oldIndex, newIndex))
  }

  return (
    <div>
      <h2>Automatic song voting</h2>
      <RuleList rules={rules} edit={editRule} remove={deleteRule} reorder={reorderRules} />
      <button type="button" onClick={handleAdd}>
        Add rule
      </button>

      {addModal && (
        <Modal onClose={handleCloseAddModal}>
          <RuleForm save={addRule} cancel={handleCloseAddModal} />
        </Modal>
      )}

      {editRuleModal && (
        <Modal onClose={handleCloseEditModal}>
          <RuleForm rule={editRuleModal} save={updateRule} cancel={handleCloseEditModal} />
        </Modal>
      )}
    </div>
  )
}
