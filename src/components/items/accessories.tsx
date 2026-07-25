import { PALETTE } from '@/lib/palette'
import { project, points } from '@/lib/iso'
import { shade, tint } from '@/lib/color'
import { Box, Slab, Cylinder, Shadow, STROKE } from './primitives'

/** Articulated desk lamp. The only item allowed to emit `sun`. */
export function DeskLamp() {
  const base = project(0, 0, 2)
  const elbow = project(0, 6, 34)
  const head = project(-14, 10, 30)

  return (
    <g>
      <Cylinder r={7} h={2} fill={PALETTE.slate} />
      <g
        stroke={shade(PALETTE.slate, 1.05)}
        strokeWidth={STROKE * 2}
        fill="none"
        strokeLinecap="round"
      >
        <path d={`M ${base.x} ${base.y - 1} L ${elbow.x} ${elbow.y}`} />
        <path d={`M ${elbow.x} ${elbow.y} L ${head.x} ${head.y}`} />
      </g>
      {/* Shade, drawn as a tapered cone pointing down at the desk. */}
      <path
        d={`M ${head.x - 9} ${head.y - 1} L ${head.x + 9} ${head.y - 1} L ${head.x + 5} ${head.y + 8} L ${head.x - 5} ${head.y + 8} Z`}
        fill={PALETTE.slate}
        stroke={shade(PALETTE.slate, 0.6)}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <ellipse
        cx={head.x}
        cy={head.y + 8}
        rx={5}
        ry={2.4}
        fill={PALETTE.sun}
        stroke="none"
      />
      {/*
       * Pool of light, placed on the item's own base plane rather than at a
       * screen-space offset — otherwise it drifts off the desktop and reads as
       * a stain on the floor.
       */}
      <ellipse
        cx={project(-14, 10, 0).x}
        cy={project(-14, 10, 0).y}
        rx={17}
        ry={8.5}
        fill={PALETTE.sun}
        opacity={0.18}
      />
    </g>
  )
}

/** Monstera in a terracotta pot. Floor-sized. */
export function PlantMonstera() {
  const leaves = [
    { x: -13, z: 52, r: 13, a: -22 },
    { x: 12, z: 58, r: 14, a: 18 },
    { x: -3, z: 68, r: 12, a: -4 },
    { x: 16, z: 44, r: 10, a: 34 },
    { x: -18, z: 38, r: 10, a: -38 },
  ]
  const stemFrom = project(0, 0, 20)

  return (
    <g>
      <Shadow w={44} d={44} opacity={0.13} />
      <Cylinder r={15} h={22} fill={PALETTE.teak} taper={0.82} />
      <ellipse
        cx={project(0, 0, 22).x}
        cy={project(0, 0, 22).y}
        rx={12}
        ry={6}
        fill={shade(PALETTE.ink, 1.6)}
      />
      <g stroke={shade(PALETTE.leaf, 0.7)} strokeWidth={STROKE} fill="none">
        {leaves.map((l, i) => {
          const p = project(l.x, 0, l.z)
          return (
            <path
              key={`s${i}`}
              d={`M ${stemFrom.x} ${stemFrom.y} Q ${(stemFrom.x + p.x) / 2} ${p.y + 8} ${p.x} ${p.y}`}
            />
          )
        })}
      </g>
      {leaves.map((l, i) => {
        const p = project(l.x, 0, l.z)
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${l.a})`}>
            {/* Split-leaf silhouette: one notch per side is enough to read. */}
            <path
              d={`M 0 ${l.r} C ${l.r} ${l.r * 0.4} ${l.r * 0.9} ${-l.r * 0.6} 0 ${-l.r}
                  C ${-l.r * 0.9} ${-l.r * 0.6} ${-l.r} ${l.r * 0.4} 0 ${l.r} Z`}
              fill={i % 2 ? PALETTE.leaf : shade(PALETTE.leaf, 1.18)}
              stroke={shade(PALETTE.leaf, 0.65)}
              strokeWidth={STROKE}
            />
            <line
              x1={0}
              y1={l.r * 0.8}
              x2={0}
              y2={-l.r * 0.8}
              stroke={shade(PALETTE.leaf, 0.7)}
              strokeWidth={1}
            />
          </g>
        )
      })}
    </g>
  )
}

/** Small desk succulent, for when the floor plant is too much. */
export function PlantDesk() {
  const pads = [
    { x: -4, z: 12, r: 5 },
    { x: 4, z: 13, r: 5.5 },
    { x: 0, z: 17, r: 4.5 },
  ]
  return (
    <g>
      <Cylinder r={7} h={9} fill={tint(PALETTE.teak, 0.18)} taper={0.85} />
      {pads.map((p, i) => {
        const q = project(p.x, 0, p.z)
        return (
          <ellipse
            key={i}
            cx={q.x}
            cy={q.y}
            rx={p.r}
            ry={p.r * 0.8}
            fill={i % 2 ? PALETTE.leaf : shade(PALETTE.leaf, 1.2)}
            stroke={shade(PALETTE.leaf, 0.65)}
            strokeWidth={STROKE}
          />
        )
      })}
    </g>
  )
}

/** Low-profile mechanical keyboard. */
export function Keyboard() {
  return (
    <g>
      <Box w={44} d={15} h={2.2} fill={shade(PALETTE.slate, 1.5)} />
      {/*
       * Key rows as real quads on the top face. Hairlines were invisible at
       * stage scale; four courses of keycaps read as a keyboard immediately.
       */}
      <g>
        {[-4.5, -1.5, 1.5, 4.5].map((dy) => (
          <polygon
            key={dy}
            points={points([
              project(-19, dy - 1.1, 2.4),
              project(19, dy - 1.1, 2.4),
              project(19, dy + 1.1, 2.4),
              project(-19, dy + 1.1, 2.4),
            ])}
            fill={shade(PALETTE.linen, 0.98)}
            stroke={shade(PALETTE.slate, 1.2)}
            strokeWidth={0.5}
          />
        ))}
      </g>
    </g>
  )
}

/** Laptop on a stand — the thing most nomads actually arrive holding. */
export function LaptopStand() {
  /** Hinge sits at the back of the raised tray; the lid leans away from there. */
  const hingeL = project(-15, -9, 15)
  const hingeR = project(15, -9, 15)
  const topL = project(-14, -20, 38)
  const topR = project(14, -20, 38)

  return (
    <g>
      <Shadow w={34} d={26} opacity={0.11} />
      {/* Riser legs, front and back on each side. */}
      <g
        stroke={PALETTE.steel}
        strokeWidth={STROKE * 2.2}
        fill="none"
        strokeLinecap="round"
      >
        {[-14, 14].map((sx) => (
          <path
            key={sx}
            d={`M ${project(sx, 10, 0).x} ${project(sx, 10, 0).y}
                L ${project(sx, 10, 8).x} ${project(sx, 10, 8).y}
                L ${project(sx, -8, 14).x} ${project(sx, -8, 14).y}`}
          />
        ))}
      </g>
      {/* Raised tray, then the open lid behind it. */}
      <Box w={34} d={23} h={1.6} y={0} z={13} fill={shade(PALETTE.steel, 1.12)} />
      <polygon
        points={points([hingeL, hingeR, topR, topL])}
        fill={shade(PALETTE.slate, 0.9)}
        stroke={shade(PALETTE.ink, 1.3)}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Keyboard deck on the tray, so it reads as a laptop not a shelf. */}
      <polygon
        points={points([
          project(-13, 0, 14.8),
          project(13, 0, 14.8),
          project(13, 8, 14.8),
          project(-13, 8, 14.8),
        ])}
        fill={shade(PALETTE.slate, 1.45)}
      />
    </g>
  )
}

/** Coffee mug. Small, warm, and the reason the desk has a ring on it. */
export function Mug() {
  const h = 9
  const handle = project(5, 0, h * 0.55)
  return (
    <g>
      <Cylinder r={4} h={h} fill={tint(PALETTE.surf, 0.55)} />
      <path
        d={`M ${handle.x} ${handle.y} q 5 -1 4 3 q -1 3 -4 2.5`}
        fill="none"
        stroke={shade(PALETTE.surf, 0.8)}
        strokeWidth={STROKE * 1.4}
        strokeLinecap="round"
      />
    </g>
  )
}

/** Jute floor rug, to stop the plan from feeling like bare concrete. */
export function RugJute() {
  return (
    <g>
      <Slab w={190} d={150} fill={shade(PALETTE.linen, 1.02)} stroke={shade(PALETTE.linen, 0.8)} />
      <Slab w={170} d={130} fill="none" stroke={shade(PALETTE.linen, 0.78)} dashed />
    </g>
  )
}
