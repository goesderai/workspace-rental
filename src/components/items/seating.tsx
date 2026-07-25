import { PALETTE } from '@/lib/palette'
import { project } from '@/lib/iso'
import { shade } from '@/lib/color'
import { Box, Panel, Cylinder, Shadow, STROKE } from './primitives'

/** Five-star caster base, drawn as spokes from the column foot. */
function StarBase({ r = 26, fill }: { r?: number; fill: string }) {
  const c = project(0, 0, 4)
  // Spoke tips are placed in world space, then projected, so the star lies flat
  // on the floor plane instead of looking like a screen-space pinwheel.
  const spokes = [18, 90, 162, 234, 306].map((deg) => {
    const a = (deg * Math.PI) / 180
    return project(Math.cos(a) * r, Math.sin(a) * r, 4)
  })
  return (
    <g>
      {spokes.map((p, i) => (
        <line
          key={i}
          x1={c.x}
          y1={c.y}
          x2={p.x}
          y2={p.y}
          stroke={shade(fill, 0.9)}
          strokeWidth={STROKE * 3}
          strokeLinecap="round"
        />
      ))}
      {spokes.map((p, i) => (
        <ellipse
          key={`c${i}`}
          cx={p.x}
          cy={p.y + 2.5}
          rx={3.2}
          ry={2.2}
          fill={shade(fill, 0.6)}
        />
      ))}
    </g>
  )
}

/** Ergonomic mesh task chair. */
export function ChairErgonomic() {
  const seatZ = 46
  return (
    <g>
      <Shadow w={62} d={62} opacity={0.15} />
      <StarBase fill={PALETTE.steel} />
      <Cylinder r={4} h={seatZ - 6} z={3} fill={PALETTE.steel} />

      <Box w={48} d={46} h={7} z={seatZ} fill={PALETTE.slate} />

      {/* Armrests, each on a visible post so they read as arms not blocks. */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <Box
            x={s * 26}
            y={8}
            w={3}
            d={3}
            h={16}
            z={seatZ + 7}
            fill={shade(PALETTE.slate, 0.8)}
          />
          <Box
            x={s * 26}
            y={-1}
            w={5}
            d={20}
            h={3.5}
            z={seatZ + 23}
            fill={shade(PALETTE.slate, 0.92)}
          />
        </g>
      ))}

      {/*
       * Backrest last: it sits nearest the viewer, matching the reference
       * sketch's view from behind the seat, so it must occlude the cushion.
       */}
      <Panel
        w={42}
        h={54}
        y={21}
        z={seatZ + 5}
        tiltBack={9}
        fill={shade(PALETTE.slate, 1.12)}
      />
      {/* Lumbar seam, the one line that says "mesh task chair". */}
      <Panel w={42} h={3} y={21} z={seatZ + 26} tiltBack={4} fill={shade(PALETTE.slate, 0.8)} />
    </g>
  )
}

/**
 * Teak four-leg chair with a slatted back — the local-workshop alternative to
 * another mesh task chair, and unmistakably a chair at stage scale.
 */
export function ChairTeak() {
  const seatZ = 44
  const slats = [0, 9, 18]

  return (
    <g>
      <Shadow w={44} d={44} opacity={0.13} />

      {/* Legs, splayed very slightly outward at the foot. */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sy]) => (
        <Box
          key={`${sx}${sy}`}
          x={sx * 17}
          y={sy * 17}
          w={4}
          d={4}
          h={seatZ}
          fill={PALETTE.teak}
        />
      ))}

      <Box w={42} d={40} h={5} z={seatZ} fill={shade(PALETTE.teak, 1.06)} />

      {/* Back posts and horizontal slats, drawn last: they sit nearest. */}
      {[-1, 1].map((s) => (
        <Box
          key={s}
          x={s * 18}
          y={17}
          w={4}
          d={4}
          h={44}
          z={seatZ + 5}
          fill={PALETTE.teak}
        />
      ))}
      {slats.map((dz) => (
        <Box
          key={dz}
          y={17}
          w={34}
          d={2.6}
          h={5}
          z={seatZ + 20 + dz}
          fill={shade(PALETTE.teak, 1.12)}
        />
      ))}
    </g>
  )
}
