import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Active,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableItem } from '@/components/SortableItem'
import { RuleListItem } from './RuleListItem'
import { type Rule } from '@/utils/rule'

type RuleListProps = {
  rules: Rule[]
  edit: (rule: Rule) => void
  remove: (index: number) => void
  reorder: (oldIndex: number, newIndex: number) => void
}

export function RuleList({ rules, edit, remove, reorder }: RuleListProps) {
  const [active, setActive] = useState<Active | null>(null)

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActive(active)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const activeIndex = rules.findIndex((r) => r.id === active.id)
    const overIndex = rules.findIndex((r) => r.id === over.id)
    reorder(activeIndex, overIndex)
    setActive(null)
  }

  const handleDragCancel = () => {
    setActive(null)
  }

  const handleEdit = (rule: Rule) => {
    edit(rule)
  }

  const handleDelete = (index: number) => {
    remove(index)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeItem = useMemo(() => {
    const index = rules.findIndex((r) => r.id === active?.id)
    if (index > -1 && index < rules.length) {
      return {
        rule: rules[index],
        index,
      }
    }
    return null
  }, [active, rules])

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={rules} strategy={verticalListSortingStrategy}>
        {rules.map((r, ri) => (
          <SortableItem key={r.id} id={r.id}>
            <RuleListItem rule={r} index={ri} handleEdit={handleEdit} handleDelete={handleDelete} />
          </SortableItem>
        ))}
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <RuleListItem
            rule={activeItem.rule}
            index={activeItem.index}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
