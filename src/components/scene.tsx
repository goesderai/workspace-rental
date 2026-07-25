/**
 * Pieces shared by the interactive stage and the static one on checkout, so the
 * plan you review is drawn by the same code that drew the plan you built.
 */

import { project, points } from '@/lib/iso'
import { PALETTE } from '@/lib/palette'
import { ROOM } from '@/lib/slots'

/** Plan grid spacing in centimetres. Heavier line every metre. */
const GRID = 20

export function PlanGrid() {
  const lines: React.ReactElement[] = []
  for (let x = 0; x <= ROOM.w; x += GRID) {
    const a = project(x, 0)
    const b = project(x, ROOM.d)
    lines.push(
      <line
        key={`x${x}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        strokeWidth={x % 100 === 0 ? 1.1 : 0.6}
      />,
    )
  }
  for (let y = 0; y <= ROOM.d; y += GRID) {
    const a = project(0, y)
    const b = project(ROOM.w, y)
    lines.push(
      <line
        key={`y${y}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        strokeWidth={y % 100 === 0 ? 1.1 : 0.6}
      />,
    )
  }
  return (
    <g stroke={PALETTE.grid} strokeLinecap="square">
      {lines}
    </g>
  )
}

export function Floor() {
  return (
    <polygon
      points={points([
        project(0, 0),
        project(ROOM.w, 0),
        project(ROOM.w, ROOM.d),
        project(0, ROOM.d),
      ])}
      fill={PALETTE.paper}
    />
  )
}

/**
 * Frames the whole room plus headroom for tall items. Derived from the room
 * bounds rather than hand-tuned, so it survives changes to room or desk size.
 */
export function stageViewBox(): string {
  const corners = [
    project(0, 0),
    project(ROOM.w, 0),
    project(ROOM.w, ROOM.d),
    project(0, ROOM.d),
  ]
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
