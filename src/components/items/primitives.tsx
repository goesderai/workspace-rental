/**
 * Shared isometric drawing primitives.
 *
 * Every item in this folder is authored in local centimetres around the centre
 * of its own footprint at floor level, and drawn only through these helpers.
 * That is what keeps the camera angle, stroke weight and light direction
 * identical across the scene — the whole illusion depends on it.
 */

import { LIGHT, project, points, type Vec3 } from '@/lib/iso'
import { shade, tint } from '@/lib/color'

/** One shared stroke weight for all linework. */
export const STROKE = 1.6

type BoxProps = {
  /** Footprint size in centimetres. */
  w: number
  d: number
  h: number
  /** Offset of the box centre from the item's local origin. */
  x?: number
  y?: number
  z?: number
  fill: string
  /** Omit the top face when something else sits flush on top of it. */
  showTop?: boolean
  stroke?: string
}

/**
 * An axis-aligned box. Faces are drawn back-to-front and shaded from the one
 * global light direction, so boxes always read as solid.
 */
export function Box({
  w,
  d,
  h,
  x = 0,
  y = 0,
  z = 0,
  fill,
  showTop = true,
  stroke,
}: BoxProps) {
  const o: Vec3 = { x: x - w / 2, y: y - d / 2, z }
  const line = stroke ?? shade(fill, 0.55)

  const top = points([
    project(o.x, o.y, o.z + h),
    project(o.x + w, o.y, o.z + h),
    project(o.x + w, o.y + d, o.z + h),
    project(o.x, o.y + d, o.z + h),
  ])
  const front = points([
    project(o.x, o.y + d, o.z + h),
    project(o.x + w, o.y + d, o.z + h),
    project(o.x + w, o.y + d, o.z),
    project(o.x, o.y + d, o.z),
  ])
  const side = points([
    project(o.x + w, o.y, o.z + h),
    project(o.x + w, o.y + d, o.z + h),
    project(o.x + w, o.y + d, o.z),
    project(o.x + w, o.y, o.z),
  ])

  return (
    <g stroke={line} strokeWidth={STROKE} strokeLinejoin="round">
      <polygon points={front} fill={shade(fill, LIGHT.mid)} />
      <polygon points={side} fill={shade(fill, LIGHT.dark)} />
      {showTop && <polygon points={top} fill={shade(fill, LIGHT.lit)} />}
    </g>
  )
}

/** A flat panel lying on the floor: rugs, mats, the plan outline of a slot. */
export function Slab({
  w,
  d,
  x = 0,
  y = 0,
  z = 0,
  fill,
  stroke,
  opacity = 1,
  dashed = false,
}: {
  w: number
  d: number
  x?: number
  y?: number
  z?: number
  fill: string
  stroke?: string
  opacity?: number
  dashed?: boolean
}) {
  const o = { x: x - w / 2, y: y - d / 2 }
  return (
    <polygon
      points={points([
        project(o.x, o.y, z),
        project(o.x + w, o.y, z),
        project(o.x + w, o.y + d, z),
        project(o.x, o.y + d, z),
      ])}
      fill={fill}
      opacity={opacity}
      stroke={stroke ?? 'none'}
      strokeWidth={STROKE}
      strokeDasharray={dashed ? '6 5' : undefined}
      strokeLinejoin="round"
    />
  )
}

/**
 * A thin upright panel facing the viewer: monitor screens, chair backs.
 * `tiltBack` leans the top edge away from the viewer in world units.
 */
export function Panel({
  w,
  h,
  x = 0,
  y = 0,
  z = 0,
  tiltBack = 0,
  fill,
  stroke,
}: {
  w: number
  h: number
  x?: number
  y?: number
  z?: number
  tiltBack?: number
  fill: string
  stroke?: string
}) {
  const bl = project(x - w / 2, y, z)
  const br = project(x + w / 2, y, z)
  const tr = project(x + w / 2, y + tiltBack, z + h)
  const tl = project(x - w / 2, y + tiltBack, z + h)
  return (
    <polygon
      points={points([bl, br, tr, tl])}
      fill={fill}
      stroke={stroke ?? shade(fill, 0.55)}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
  )
}

/** A vertical cylinder, flattened to the iso camera: chair columns, mugs, pots. */
export function Cylinder({
  r,
  h,
  x = 0,
  y = 0,
  z = 0,
  fill,
  taper = 1,
}: {
  r: number
  h: number
  x?: number
  y?: number
  z?: number
  fill: string
  /** Radius multiplier at the top, for plant pots and lamp shades. */
  taper?: number
}) {
  const base = project(x, y, z)
  const cap = project(x, y, z + h)
  const rt = r * taper
  const line = shade(fill, 0.55)
  return (
    <g stroke={line} strokeWidth={STROKE} strokeLinejoin="round">
      <path
        d={`M ${base.x - r} ${base.y} L ${cap.x - rt} ${cap.y} A ${rt} ${rt * 0.5} 0 0 1 ${cap.x + rt} ${cap.y} L ${base.x + r} ${base.y} A ${r} ${r * 0.5} 0 0 1 ${base.x - r} ${base.y} Z`}
        fill={shade(fill, LIGHT.mid)}
      />
      <ellipse
        cx={cap.x}
        cy={cap.y}
        rx={rt}
        ry={rt * 0.5}
        fill={shade(fill, LIGHT.lit)}
      />
    </g>
  )
}

/** Soft contact shadow under an item, so nothing looks pasted on. */
export function Shadow({
  w,
  d,
  x = 0,
  y = 0,
  opacity = 0.14,
}: {
  w: number
  d: number
  x?: number
  y?: number
  opacity?: number
}) {
  const c = project(x, y, 0)
  return (
    <ellipse
      cx={c.x}
      cy={c.y}
      rx={w / 2}
      ry={(d / 2) * 0.5}
      fill="var(--ink)"
      opacity={opacity}
    />
  )
}

/** Screen glass gets a single specular sweep rather than a gradient wash. */
export function glassTones(fill: string) {
  return { face: fill, glint: tint(fill, 0.22) }
}
