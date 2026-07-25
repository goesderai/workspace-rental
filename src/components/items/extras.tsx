/**
 * Bali extras. monis.rent really does rent these alongside the office kit, and
 * they are the reason the plan reads as Canggu rather than a co-working chain.
 */

import { PALETTE } from '@/lib/palette'
import { project, points } from '@/lib/iso'
import { shade, tint } from '@/lib/color'
import { Box, Cylinder, Shadow, STROKE } from './primitives'

/** Surfboard leaning against nothing in particular, nose up. */
export function Surfboard() {
  /**
   * Leaned back against an implied wall. The board is widened well past its
   * real 50cm — a true-width board projects to a sliver and reads as a leaf.
   */
  const tail = project(0, 16, 4)
  const nose = project(0, -22, 172)
  const beam = 30

  return (
    <g>
      <Shadow w={34} d={30} opacity={0.12} />
      <path
        d={`M ${tail.x} ${tail.y}
            C ${tail.x - beam} ${tail.y - 44} ${nose.x - beam * 0.8} ${nose.y + 52} ${nose.x} ${nose.y}
            C ${nose.x + beam * 0.8} ${nose.y + 52} ${tail.x + beam} ${tail.y - 44} ${tail.x} ${tail.y} Z`}
        fill={tint(PALETTE.sun, 0.4)}
        stroke={shade(PALETTE.teak, 0.85)}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Stringer and a single deck stripe: the whole surf vernacular in two lines. */}
      <path
        d={`M ${tail.x} ${tail.y} L ${nose.x} ${nose.y}`}
        fill="none"
        stroke={shade(PALETTE.teak, 0.9)}
        strokeWidth={1.2}
        opacity={0.6}
      />
      <path
        d={`M ${tail.x - 17} ${tail.y - 62} L ${tail.x + 17} ${tail.y - 62}`}
        fill="none"
        stroke={PALETTE.surf}
        strokeWidth={4}
        opacity={0.8}
      />
    </g>
  )
}

/** The rented scooter, drawn side-on to the iso grid. */
export function Scooter() {
  const wheelF = project(-46, 0, 9)
  const wheelR = project(42, 0, 9)
  const bars = project(-42, 0, 82)

  const wheel = (c: { x: number; y: number }) => (
    <g>
      <circle
        cx={c.x}
        cy={c.y}
        r={9.5}
        fill={shade(PALETTE.ink, 1.7)}
        stroke={shade(PALETTE.ink, 1.1)}
        strokeWidth={1}
      />
      <circle
        cx={c.x}
        cy={c.y}
        r={4}
        fill={PALETTE.steel}
        stroke={shade(PALETTE.steel, 0.6)}
        strokeWidth={1}
      />
    </g>
  )

  return (
    <g>
      <Shadow w={96} d={24} opacity={0.14} />
      {wheel(wheelR)}
      {wheel(wheelF)}

      {/* Step-through body: footwell dips between the two wheels. */}
      <polygon
        points={points([
          project(-38, 0, 30),
          project(-24, 0, 22),
          project(10, 0, 22),
          project(20, 0, 40),
          project(40, 0, 44),
          project(44, 0, 30),
          project(26, 0, 16),
          project(-20, 0, 14),
          project(-34, 0, 16),
        ])}
        fill={PALETTE.surf}
        stroke={shade(PALETTE.surf, 0.6)}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Saddle. */}
      <polygon
        points={points([
          project(6, 0, 44),
          project(34, 0, 48),
          project(40, 0, 44),
          project(20, 0, 40),
        ])}
        fill={shade(PALETTE.ink, 1.4)}
        stroke={shade(PALETTE.ink, 1)}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Fork, stem and bars. */}
      <g
        stroke={shade(PALETTE.steel, 0.8)}
        strokeWidth={STROKE * 2.2}
        fill="none"
        strokeLinecap="round"
      >
        <path d={`M ${wheelF.x} ${wheelF.y} L ${bars.x} ${bars.y}`} />
        <path d={`M ${bars.x - 11} ${bars.y + 2} L ${bars.x + 9} ${bars.y - 4}`} />
      </g>
      {/* Headlight. */}
      <circle
        cx={project(-40, 0, 66).x}
        cy={project(-40, 0, 66).y}
        r={4}
        fill={PALETTE.sun}
        stroke={shade(PALETTE.steel, 0.7)}
        strokeWidth={1}
      />
    </g>
  )
}

/** Espresso machine, because the alternative is leaving the villa. */
export function CoffeeMachine() {
  const group = project(0, -14, 22)
  return (
    <g>
      <Shadow w={34} d={30} opacity={0.12} />
      {/* Tall body with a recessed brew bay cut into the front. */}
      <Box w={28} d={26} h={42} fill={tint(PALETTE.steel, 0.34)} />
      {/* Brew bay: dark void so the machine is not read as a plain block. */}
      <polygon
        points={points([
          project(-11, -13, 6),
          project(11, -13, 6),
          project(11, -13, 24),
          project(-11, -13, 24),
        ])}
        fill={shade(PALETTE.slate, 0.7)}
      />
      {/* Group head and portafilter. */}
      <Box w={13} d={7} h={3.5} y={-11} z={21} fill={PALETTE.slate} />
      <path
        d={`M ${group.x} ${group.y + 2} l 0 5`}
        stroke={PALETTE.steel}
        strokeWidth={STROKE * 2}
        strokeLinecap="round"
      />
      {/* Cup on the drip tray, catching it. */}
      <Cylinder r={4} h={7} y={-11} z={6} fill="#FBFAF6" />
      <Box w={18} d={11} h={1.6} y={-11} z={5} fill={shade(PALETTE.slate, 1.1)} />
      {/* Steam wand and the one warm indicator. */}
      <path
        d={`M ${project(12, -12, 30).x} ${project(12, -12, 30).y} l 3 9`}
        stroke={PALETTE.steel}
        strokeWidth={STROKE * 1.4}
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx={project(-8, -13, 34).x}
        cy={project(-8, -13, 34).y}
        r={2.4}
        fill={PALETTE.sun}
      />
    </g>
  )
}

/** Bean bag, for the part of the day that is not work. */
export function BeanBag() {
  const c = project(0, 0, 0)
  return (
    <g>
      <Shadow w={62} d={62} opacity={0.13} />
      {/*
       * A slumped pear, not an ellipse: wide sagging base, narrower shoulders
       * leaning back. The previous version was flat enough to read as a rug.
       */}
      <path
        d={`M ${c.x - 36} ${c.y - 6}
            C ${c.x - 42} ${c.y - 34} ${c.x - 26} ${c.y - 62} ${c.x - 2} ${c.y - 62}
            C ${c.x + 22} ${c.y - 62} ${c.x + 34} ${c.y - 40} ${c.x + 34} ${c.y - 14}
            C ${c.x + 34} ${c.y + 4} ${c.x + 18} ${c.y + 12} ${c.x - 4} ${c.y + 12}
            C ${c.x - 24} ${c.y + 12} ${c.x - 34} ${c.y + 4} ${c.x - 36} ${c.y - 6} Z`}
        fill={PALETTE.leaf}
        stroke={shade(PALETTE.leaf, 0.6)}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      {/* Seam and a compression crease where someone last sat. */}
      <path
        d={`M ${c.x - 30} ${c.y - 20} C ${c.x - 10} ${c.y - 34} ${c.x + 16} ${c.y - 34} ${c.x + 32} ${c.y - 18}`}
        fill="none"
        stroke={shade(PALETTE.leaf, 0.74)}
        strokeWidth={1.4}
        opacity={0.85}
      />
      <path
        d={`M ${c.x - 14} ${c.y - 54} C ${c.x - 2} ${c.y - 46} ${c.x + 8} ${c.y - 46} ${c.x + 18} ${c.y - 52}`}
        fill="none"
        stroke={shade(PALETTE.leaf, 0.8)}
        strokeWidth={1.2}
        opacity={0.6}
      />
    </g>
  )
}

/** Standing fan. Bali is 30 degrees and the villa has no air conditioning. */
export function Fan() {
  const hub = project(0, 0, 96)
  return (
    <g>
      <Shadow w={34} d={34} opacity={0.11} />
      <Cylinder r={13} h={4} fill={PALETTE.linen} />
      <Cylinder r={2.6} h={82} z={4} fill={shade(PALETTE.linen, 0.92)} />
      <circle
        cx={hub.x}
        cy={hub.y}
        r={17}
        fill={tint(PALETTE.steel, 0.4)}
        opacity={0.55}
        stroke={shade(PALETTE.steel, 0.7)}
        strokeWidth={STROKE}
      />
      <g stroke={shade(PALETTE.steel, 0.7)} strokeWidth={1} opacity={0.8} fill="none">
        <circle cx={hub.x} cy={hub.y} r={11} />
        <circle cx={hub.x} cy={hub.y} r={5.5} />
      </g>
      <circle cx={hub.x} cy={hub.y} r={3} fill={PALETTE.steel} />
    </g>
  )
}
