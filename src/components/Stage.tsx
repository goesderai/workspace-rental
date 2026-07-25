'use client'

import { project, points } from '@/lib/iso'
import { PALETTE } from '@/lib/palette'
import { ROOM } from '@/lib/slots'
import { DeskMechanical } from './items/desks'
import { ChairErgonomic } from './items/seating'
import { isoTranslate } from '@/lib/iso'
import { anchorsFor } from '@/lib/slots'

/** Plan grid spacing in centimetres. One line every 20cm, heavier every metre. */
const GRID = 20

function PlanGrid() {
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

/**
 * Frames the whole room plus headroom for tall items, so the view never needs
 * hand-tuned magic numbers when the room or a desk changes size.
 */
function viewBox(): string {
  const corners = [
    project(0, 0),
    project(ROOM.w, 0),
    project(ROOM.w, ROOM.d),
    project(0, ROOM.d),
  ]
  const xs = corners.map((c) => c.x)
  const ys = corners.map((c) => c.y)
  const pad = 22
  /**
   * Screen-space room above the back corner. A monitor on a standing desk tops
   * out near the projected origin, so this only needs to clear the callouts.
   */
  const headroom = 74

  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - headroom
  const maxY = Math.max(...ys) + pad

  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
}

function Floor() {
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
 * The isometric scene. Geometry check for now: floor, plan grid, and one desk
 * with a chair sitting on their real anchors.
 */
export default function Stage() {
  const anchors = anchorsFor({ w: 140, d: 70, h: 74 })

  return (
    <svg
      viewBox={viewBox()}
      className="h-full w-full"
      role="img"
      aria-label="Isometric plan of the workspace"
    >
      <Floor />
      <PlanGrid />
      <g transform={isoTranslate(anchors.DESK.x, anchors.DESK.y, anchors.DESK.z)}>
        <DeskMechanical />
      </g>
      <g transform={isoTranslate(anchors.CHAIR.x, anchors.CHAIR.y, anchors.CHAIR.z)}>
        <ChairErgonomic />
      </g>
    </svg>
  )
}
