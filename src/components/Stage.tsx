'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { isoTranslate, project, points } from '@/lib/iso'
import { PALETTE } from '@/lib/palette'
import {
  anchorsFor,
  DESK_DEPENDENT,
  SLOT_ACCEPTS,
  SLOT_LABELS,
  SLOT_ORDER,
  type SlotId,
} from '@/lib/slots'
import { deskItem, entriesOf } from '@/lib/state'
import { money } from '@/lib/pricing'
import { getItem, type Item } from '@/data/catalog'
import { useWorkspace } from './WorkspaceProvider'
import { Floor, PlanGrid, stageViewBox } from './scene'

/**
 * Dashed footprint marking a slot that would accept what you are holding, and
 * the drop target for it. Highlights while the pointer is over it.
 */
function SlotGhost({
  slot,
  at,
  size,
  shown,
}: {
  slot: SlotId
  at: { x: number; y: number; z: number }
  size: number
  /** Whether this slot would accept what the person is currently reaching for. */
  shown: boolean
}) {
  const { focused, setFocused } = useWorkspace()
  const { setNodeRef, isOver } = useDroppable({ id: slot })
  const active = isOver || focused === slot
  const half = size / 2

  return (
    <g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      transform={isoTranslate(at.x, at.y, at.z)}
      onMouseEnter={() => setFocused(slot)}
      onMouseLeave={() => setFocused((cur) => (cur === slot ? null : cur))}
      aria-label={`Drop in ${SLOT_LABELS[slot]}`}
      /*
       * Kept mounted even when hidden. dnd-kit measures droppables as a drag
       * starts, and a target that only appears once the drag is under way is
       * never measured — so the drop silently does nothing.
       */
      opacity={shown ? 1 : 0}
      pointerEvents={shown ? 'auto' : 'none'}
      aria-hidden={!shown}
    >
      <polygon
        points={points([
          project(-half, -half),
          project(half, -half),
          project(half, half),
          project(-half, half),
        ])}
        fill={PALETTE.surf}
        fillOpacity={active ? 0.16 : 0.04}
        stroke={PALETTE.surf}
        strokeWidth={active ? 2.6 : 1.4}
        strokeDasharray="7 5"
        opacity={active ? 1 : 0.55}
      />
    </g>
  )
}

/** A placed item: draggable, and dragging it off the stage removes it. */
function PlacedItem({
  slot,
  item,
  at,
}: {
  slot: SlotId
  item: Item
  at: { x: number; y: number; z: number }
}) {
  const { dispatch, setFocused } = useWorkspace()
  const reduced = useReducedMotion()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed:${slot}`,
    data: { item, from: slot },
  })

  return (
    <motion.g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      style={{ transformOrigin: 'center' }}
      onMouseEnter={() => setFocused(slot)}
      onMouseLeave={() => setFocused((cur) => (cur === slot ? null : cur))}
      onClick={() => dispatch({ type: 'remove', slot })}
      className="cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <g transform={isoTranslate(at.x, at.y, at.z)}>
        <item.Art />
      </g>
    </motion.g>
  )
}

/**
 * The architect's callout: a leader line out of the item to its name, real
 * dimensions and weekly rate, set in mono. This is the signature element — it
 * turns hover into a spec annotation instead of a tooltip.
 */
function Callout({
  slot,
  at,
}: {
  slot: SlotId
  at: { x: number; y: number; z: number }
}) {
  const { state } = useWorkspace()
  const item = getItem(state.placements[slot] ?? '')
  if (!item) return null

  const anchor = project(at.x, at.y, at.z + Math.min(item.size.h, 90))
  const dx = 34
  const dy = -26

  return (
    <g pointerEvents="none">
      <circle cx={anchor.x} cy={anchor.y} r={2.4} fill={PALETTE.ink} />
      <path
        d={`M ${anchor.x} ${anchor.y} l ${dx} ${dy} h 96`}
        fill="none"
        stroke={PALETTE.ink}
        strokeWidth={1}
      />
      <text
        x={anchor.x + dx + 4}
        y={anchor.y + dy - 12}
        fill={PALETTE.ink}
        style={{ font: '600 11px var(--font-mono), monospace' }}
      >
        {item.name}
      </text>
      <text
        x={anchor.x + dx + 4}
        y={anchor.y + dy - 3}
        fill={PALETTE.muted}
        style={{ font: '400 10px var(--font-mono), monospace' }}
      >
        {item.size.w}×{item.size.d}×{item.size.h} cm · {money(item.priceWeekly)}/wk
      </text>
    </g>
  )
}

export default function Stage() {
  const { state, armed, focused } = useWorkspace()

  const desk = deskItem(state)
  const anchors = anchorsFor(desk?.size ?? null)
  const placed = new Map(entriesOf(state))

  /**
   * Every slot that could ever be dropped into right now. All of them stay
   * mounted as drop targets; `shown` decides which are visible.
   */
  const dropSlots = SLOT_ORDER.filter(
    (s) => !(DESK_DEPENDENT.includes(s) && !state.placements.DESK),
  )
  const accepts = (s: SlotId) => Boolean(armed && SLOT_ACCEPTS[s].includes(armed))

  const ghostSize = (slot: SlotId) =>
    slot === 'RUG' ? 150 : slot === 'DESK' ? 120 : slot === 'CHAIR' ? 56 : 40

  return (
    <svg
      viewBox={stageViewBox()}
      className="h-full w-full touch-none select-none"
      role="img"
      aria-label="Isometric plan of your workspace"
    >
      <Floor />
      <PlanGrid />

      {/*
       * The setup itself, painted in fixed depth order. `initial={false}` means
       * a setup restored from a shared link is simply there on first paint;
       * only items added afterwards drop in.
       */}
      <AnimatePresence initial={false}>
        {SLOT_ORDER.filter((s) => placed.has(s)).map((slot) => (
          <PlacedItem
            key={`${slot}:${placed.get(slot)!.id}`}
            slot={slot}
            item={placed.get(slot)!}
            at={anchors[slot]}
          />
        ))}
      </AnimatePresence>

      {/*
       * Ghosts are drawn last, over the furniture. Painted underneath, the ones
       * for desk-mounted slots disappear behind the desktop — which is exactly
       * where you most need to see them.
       */}
      {dropSlots.map((slot) => (
        <SlotGhost
          key={slot}
          slot={slot}
          at={anchors[slot]}
          size={ghostSize(slot)}
          shown={accepts(slot)}
        />
      ))}

      {focused && placed.has(focused) && <Callout slot={focused} at={anchors[focused]} />}
    </svg>
  )
}
