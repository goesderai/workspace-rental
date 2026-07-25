import { PALETTE } from '@/lib/palette'
import { project, points, type Point } from '@/lib/iso'
import { shade, tint } from '@/lib/color'
import { Box, Panel, Shadow, STROKE } from './primitives'

/**
 * A display panel standing upright with a slight backward lean.
 *
 * Everything is laid out in the screen's own plane: `u` runs across the glass
 * and `v` runs up it. That lets the specular sweep follow the lean instead of
 * cutting across it, which is the difference between glass and a grey rectangle.
 */
function Screen({
  w,
  h,
  z,
  y = 0,
  /** Negative leans the top edge away from the viewer, as a real monitor does. */
  tilt = -4,
  bezel = PALETTE.ink,
}: {
  w: number
  h: number
  z: number
  y?: number
  tilt?: number
  bezel?: string
}) {
  const at = (u: number, v: number): Point =>
    project(u, y + (v / h) * tilt, z + v)

  const glass = shade(PALETTE.slate, 0.82)
  const inset = 1.8
  const chin = 3.4

  return (
    <g>
      <Panel w={w} h={h} y={y} z={z} tiltBack={tilt} fill={bezel} />
      <polygon
        points={points([
          at(-w / 2 + inset, chin),
          at(w / 2 - inset, chin),
          at(w / 2 - inset, h - inset),
          at(-w / 2 + inset, h - inset),
        ])}
        fill={glass}
        stroke={shade(glass, 0.7)}
        strokeWidth={1}
      />
      {/* One specular sweep, following the lean of the glass. */}
      <polygon
        points={points([
          at(-w / 2 + inset, chin),
          at(-w / 2 + inset + w * 0.26, chin),
          at(-w / 2 + inset + w * 0.58, h - inset),
          at(-w / 2 + inset + w * 0.3, h - inset),
        ])}
        fill={tint(glass, 0.5)}
        opacity={0.5}
      />
      {/* Status light on the chin — reads as "it's plugged in". */}
      <circle cx={at(w / 2 - 6, chin / 2).x} cy={at(w / 2 - 6, chin / 2).y} r={0.9} fill={PALETTE.sun} />
    </g>
  )
}

/** Shared stand: flat foot, column, and a neck into the panel. */
function Stand({ footW, h }: { footW: number; h: number }) {
  return (
    <g>
      <Box w={footW} d={15} h={1.6} fill={PALETTE.slate} />
      <Box w={5} d={4} h={h} z={1.6} fill={shade(PALETTE.slate, 1.1)} />
    </g>
  )
}

/** 24" Full HD office monitor — the cheap one that does the job. */
export function Monitor24() {
  return (
    <g>
      <Shadow w={40} d={18} opacity={0.12} />
      <Stand footW={22} h={11} />
      <Screen w={53} h={30} z={12} />
    </g>
  )
}

/** 27" 4K multimedia monitor. */
export function Monitor27() {
  return (
    <g>
      <Shadow w={46} d={20} opacity={0.12} />
      <Stand footW={26} h={13} />
      <Screen w={60} h={34} z={14} />
    </g>
  )
}

/** 34" curved ultrawide. The curve is faked with a shallow arc on the top edge. */
export function MonitorUltrawide() {
  const w = 81
  const h = 35
  const z = 15
  const tilt = -4
  const lift = 5
  const l = project(-w / 2, tilt, z + h)
  const r = project(w / 2, tilt, z + h)
  const mid = project(0, tilt + lift, z + h + 1.5)

  return (
    <g>
      <Shadow w={64} d={22} opacity={0.13} />
      <Stand footW={32} h={14} />
      <Screen w={w} h={h} z={z} tilt={tilt} />
      {/* Wrap the top edge forward so the panel reads as curved. */}
      <path
        d={`M ${l.x} ${l.y} Q ${mid.x} ${mid.y} ${r.x} ${r.y}`}
        fill="none"
        stroke={shade(PALETTE.ink, 1.4)}
        strokeWidth={STROKE * 1.6}
        strokeLinecap="round"
      />
    </g>
  )
}

/** 27" 5K Studio Display — aluminium body, thin foot. */
export function StudioDisplay() {
  return (
    <g>
      <Shadow w={44} d={19} opacity={0.12} />
      <Box w={20} d={13} h={1.4} fill={PALETTE.steel} />
      <Box w={4} d={3} h={13} z={1.4} fill={tint(PALETTE.steel, 0.1)} />
      <Screen w={60} h={34} z={14} bezel={tint(PALETTE.steel, 0.25)} />
    </g>
  )
}
