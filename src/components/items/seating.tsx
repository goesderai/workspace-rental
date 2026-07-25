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

/** Woven rattan lounge stool — the local alternative to another office chair. */
export function StoolRattan() {
  const h = 44
  const weave = [0.3, 0.55, 0.8]
  return (
    <g>
      <Shadow w={46} d={46} opacity={0.13} />
      <Cylinder r={22} h={h} fill={PALETTE.teak} taper={0.94} />
      {/* Two courses of weave read as rattan without drawing every strand. */}
      <g stroke={shade(PALETTE.teak, 0.6)} strokeWidth={STROKE} fill="none" opacity={0.7}>
        {weave.map((t) => {
          const l = project(-22, 0, h * t)
          const r = project(22, 0, h * t)
          return (
            <path
              key={t}
              d={`M ${l.x} ${l.y} Q 0 ${(l.y + r.y) / 2 + 9} ${r.x} ${r.y}`}
            />
          )
        })}
      </g>
      <ellipse
        cx={project(0, 0, h).x}
        cy={project(0, 0, h).y}
        rx={20}
        ry={10}
        fill={shade(PALETTE.linen, 1.02)}
        stroke={shade(PALETTE.teak, 0.6)}
        strokeWidth={STROKE}
      />
    </g>
  )
}
