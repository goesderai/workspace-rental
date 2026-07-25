import { PALETTE } from '@/lib/palette'
import { project } from '@/lib/iso'
import { shade } from '@/lib/color'
import { Box, Shadow, STROKE } from './primitives'

const TOP = 4

/** Mechanical crank desk: teak top on a steel H-frame, hand crank on the right. */
export function DeskMechanical() {
  const w = 140
  const d = 70
  const h = 74
  const crank = project(w / 2 + 4, 0, h - 16)

  return (
    <g>
      <Shadow w={w * 0.92} d={d * 0.92} opacity={0.16} />

      {/* Feet, then uprights, then top: back to front, bottom to top. */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <Box x={s * (w / 2 - 12)} w={8} d={d - 8} h={4} fill={PALETTE.steel} />
          <Box
            x={s * (w / 2 - 12)}
            w={7}
            d={7}
            h={h - TOP - 4}
            z={4}
            fill={PALETTE.steel}
          />
        </g>
      ))}
      {/* Cross brace ties the two legs together. */}
      <Box w={w - 40} d={5} h={5} z={h - TOP - 22} fill={shade(PALETTE.steel, 0.9)} />

      <Box w={w} d={d} h={TOP} z={h - TOP} fill={PALETTE.teak} />

      {/* Crank handle under the right edge — the detail that names the product. */}
      <g
        stroke={shade(PALETTE.steel, 0.5)}
        strokeWidth={STROKE * 1.5}
        fill="none"
        strokeLinecap="round"
      >
        <path d={`M ${crank.x - 2} ${crank.y} l 10 6`} />
        <path d={`M ${crank.x + 8} ${crank.y + 6} l 0 7`} />
      </g>
      <circle
        cx={crank.x + 8}
        cy={crank.y + 14}
        r={2.4}
        fill={PALETTE.steel}
        stroke={shade(PALETTE.steel, 0.5)}
        strokeWidth={1}
      />
    </g>
  )
}

/** Electrical sit-stand desk: wider linen-grey top, column legs, control pad. */
export function DeskElectrical() {
  const w = 180
  const d = 75
  const h = 78
  const pad = project(-w / 2 + 26, d / 2 - 6, h - TOP)

  return (
    <g>
      <Shadow w={w * 0.92} d={d * 0.92} opacity={0.16} />

      {[-1, 1].map((s) => (
        <g key={s}>
          <Box x={s * (w / 2 - 14)} w={10} d={d - 6} h={5} fill={PALETTE.slate} />
          {/* Two-stage column reads as motorised rather than fixed. */}
          <Box
            x={s * (w / 2 - 14)}
            w={13}
            d={13}
            h={h - TOP - 5}
            z={5}
            fill={PALETTE.slate}
          />
          <Box
            x={s * (w / 2 - 14)}
            w={9}
            d={9}
            h={(h - TOP) * 0.45}
            z={h - TOP - (h - TOP) * 0.45}
            fill={shade(PALETTE.slate, 1.15)}
          />
        </g>
      ))}

      <Box w={w} d={d} h={TOP} z={h - TOP} fill={PALETTE.linen} />

      {/* Height memory pad, under the front-left edge. */}
      <g>
        <rect
          x={pad.x - 9}
          y={pad.y + 1}
          width={18}
          height={5}
          rx={2}
          fill={PALETTE.slate}
          stroke={shade(PALETTE.slate, 0.6)}
          strokeWidth={1}
        />
        <circle cx={pad.x - 3} cy={pad.y + 3.5} r={1.1} fill={PALETTE.sun} />
      </g>
    </g>
  )
}
