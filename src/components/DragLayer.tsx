'use client'

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState, type ReactNode } from 'react'
import type { Item } from '@/data/catalog'
import { SLOT_ACCEPTS, type SlotId } from '@/lib/slots'
import { ItemThumb } from './ItemThumb'
import { useWorkspace } from './WorkspaceProvider'

/** What a draggable carries. Catalog cards carry an item; placed items carry their slot. */
export type DragData = { item: Item; from?: SlotId }

/**
 * Drag and drop sits on top of a click-to-add app that already works: an 8px
 * activation distance means a tap still reads as a tap, and every action
 * remains reachable without dragging at all.
 */
export default function DragLayer({ children }: { children: ReactNode }) {
  const { dispatch, setArmed, setFocused } = useWorkspace()
  const [dragging, setDragging] = useState<DragData | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  /*
   * Every slot stays mounted as a drop target, so collisions are narrowed here
   * to the ones this particular item can occupy — the item's own slot list, not
   * just its category. The 34" ultrawide, for example, only fits the centre
   * slot, and filtering by category alone let a near miss resolve to a side slot
   * the item could not use, where the drop silently did nothing.
   */
  const collisionDetection: CollisionDetection = (args) => {
    const data = args.active.data.current as DragData | undefined
    if (!data) return []
    const allowed = args.droppableContainers.filter(
      (c) =>
        data.item.slots.includes(c.id as SlotId) &&
        SLOT_ACCEPTS[c.id as SlotId]?.includes(data.item.category),
    )
    return closestCenter({ ...args, droppableContainers: allowed })
  }

  function onDragStart({ active }: DragStartEvent) {
    const data = active.data.current as DragData | undefined
    if (!data) return
    setDragging(data)
    setArmed(data.item.category)
  }

  function onDragOver({ over }: DragOverEvent) {
    setFocused((over?.id as SlotId | undefined) ?? null)
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    const data = active.data.current as DragData | undefined
    setDragging(null)
    setArmed(null)
    setFocused(null)
    if (!data) return

    if (over) {
      dispatch({ type: 'place', itemId: data.item.id, slot: over.id as SlotId })
      return
    }
    // Dropped on nothing. Dragging a placed item off the stage removes it; a
    // catalog card dropped short still lands in its first free slot, so the
    // effort is never simply thrown away.
    if (data.from) dispatch({ type: 'remove', slot: data.from })
    else dispatch({ type: 'place', itemId: data.item.id })
  }

  function onDragCancel() {
    setDragging(null)
    setArmed(null)
    setFocused(null)
  }

  return (
    <DndContext
      /*
       * A stable id keeps dnd-kit's generated `aria-describedby` values the same
       * on the server and the client. Without it the ids come from a counter
       * that starts fresh in each environment, which hydrates as a mismatch.
       */
      id="workspace-builder"
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {dragging && (
          <div className="pointer-events-none border border-surf bg-card/90 p-1 shadow-lg">
            <ItemThumb item={dragging.item} size={64} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
