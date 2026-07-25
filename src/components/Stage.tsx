'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { isoTranslate, project, points } from '@/lib/iso'
import { PALETTE } from '@/lib/palette'
import {
  anchorsFor,
  DESK_DEPENDENT,
  ROOM,
  SLOT_ACCEPTS,
  SLOT_LABELS,
  SLOT_ORDER,
  type SlotId,
} from '@/lib/slots'
import { deskItem, entriesOf } from '@/lib/state'
import { money } from '@/lib/pricing'
import { getItem } from '@/data/catalog'
import { useWorkspace } from './WorkspaceProvider'

/** Plan grid spacing in centimetres. Heavier line every metre. */
const GRID = 20

function PlanGrid() {
  const lines: React.ReactElement[] = []
  for (let x = 0; x <= ROOM.w; x += GRID) {
    const a = project(x, 0)
    const b = project(x, ROOM.d)
    lines.push(
      <line key={`x${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={x % 100 === 0 ? 1.1 : 0.6} />,
    )
  }
  for (let y = 0; y <= ROOM.d; y += GRID) {
    const a = project(0, y)
    const b = project(ROOM.w, y)
    lines.push(
      <line key={`y${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={y % 100 === 0 ? 1.1 : 0.6} />,
    )
  }
  return (
    <g stroke={PALETTE.grid} strokeLinecap="square">
      {lines}
    </g>
  )
}

/**
 * Frames the whole room plus headroom for tall items, derived rather than
 * hand-tuned so it survives changes to room or desk size.
 */
function viewBox(): string {
  const corners = [project(0, 0), project(ROOM.w, 0), project(ROOM.w, ROOM.d), project(0, ROOM.d)]
  const xs = corners.map((c) => c.x)
  const ys = corners.map((c) => c.y)
  const pad = 26
  const headroom = 96

  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - headroom
  const maxY = Math.max(...ys) + pad
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
}

/** Dashed footprint marking a slot that would accept what you are holding. */
function SlotGhost({
  slot,
  at,
  size,
  active,
  onPick,
}: {
  slot: SlotId
  at: { x: number; y: number; z: number }
  size: number
  active: boolean
  onPick: () => void
}) {
  const half = size / 2
  return (
    <g
      transform={isoTranslate(at.x, at.y, at.z)}
      onClick={onPick}
      className="cursor-pointer"
      role="button"
      aria-label={`Place in ${SLOT_LABELS[slot]}`}
    >
      <polygon
        points={points([
          project(-half, -half),
          project(half, -half),
          project(half, half),
          project(-half, half),
        ])}
        fill={active ? PALETTE.surf : 'transparent'}
        fillOpacity={active ? 0.14 : 0}
        stroke={PALETTE.surf}
        strokeWidth={active ? 2.4 : 1.4}
        strokeDasharray="7 5"
        opacity={active ? 1 : 0.5}
      />
    </g>
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
  const { state, dispatch, armed, focused, setFocused } = useWorkspace()
  const reduced = useReducedMotion()

  const desk = deskItem(state)
  const anchors = anchorsFor(desk?.size ?? null)
  const placed = new Map(entriesOf(state))

  /** Slots that would accept the armed category and are worth offering. */
  const openSlots = armed
    ? SLOT_ORDER.filter(
        (s) =>
          SLOT_ACCEPTS[s].includes(armed) &&
          !(DESK_DEPENDENT.includes(s) && !state.placements.DESK),
      )
    : []

  const ghostSize = (slot: SlotId) =>
    slot === 'RUG' ? 150 : slot === 'DESK' ? 120 : slot === 'CHAIR' ? 56 : 40

  return (
    <svg
      viewBox={viewBox()}
      className="h-full w-full touch-none select-none"
      role="img"
      aria-label="Isometric plan of your workspace"
    >
      <polygon
        points={points([
          project(0, 0),
          project(ROOM.w, 0),
          project(ROOM.w, ROOM.d),
          project(0, ROOM.d),
        ])}
        fill={PALETTE.paper}
      />
      <PlanGrid />

      {/* The setup itself, painted in fixed depth order. */}
      <AnimatePresence>
        {SLOT_ORDER.filter((s) => placed.has(s)).map((slot) => {
          const item = placed.get(slot)!
          const at = anchors[slot]
          return (
            <motion.g
              key={`${slot}:${item.id}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              style={{ transformOrigin: 'center' }}
              onMouseEnter={() => setFocused(slot)}
              onMouseLeave={() => setFocused((cur) => (cur === slot ? null : cur))}
              onClick={() => dispatch({ type: 'remove', slot })}
              className="cursor-pointer"
            >
              <g transform={isoTranslate(at.x, at.y, at.z)}>
                <item.Art />
              </g>
            </motion.g>
          )
        })}
      </AnimatePresence>

      {/*
       * Ghosts are drawn last, over the furniture. Painted underneath, the ones
       * for desk-mounted slots disappear behind the desktop — which is exactly
       * where you most need to see them.
       */}
      {openSlots.map((slot) => (
        <SlotGhost
          key={slot}
          slot={slot}
          at={anchors[slot]}
          size={ghostSize(slot)}
          active={focused === slot}
          onPick={() => setFocused(slot)}
        />
      ))}

      {focused && placed.has(focused) && <Callout slot={focused} at={anchors[focused]} />}
    </svg>
  )
}
