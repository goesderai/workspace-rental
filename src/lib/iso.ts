/**
 * True isometric projection for the workspace stage.
 *
 * World space is right-handed and measured in centimetres, which lets us use
 * real furniture dimensions from the catalog instead of invented numbers:
 *
 *   x -> runs right along the back wall
 *   y -> runs forward, toward the viewer
 *   z -> runs up from the floor
 *
 * Screen space is SVG user units. Every asset in `components/items` is authored
 * against this projection and the light direction below, so shading agrees
 * across the whole scene.
 */

/** Horizontal foreshortening: cos(30deg). */
const ISO_X = 0.866
/** Vertical foreshortening: sin(30deg). */
const ISO_Y = 0.5

/** Light arrives from the upper-left-front. Every item shades to match. */
export const LIGHT = {
  /** Faces pointing +x (right) catch the light. */
  lit: 1,
  /** Faces pointing -y (toward viewer) sit in half tone. */
  mid: 0.86,
  /** Faces pointing +y (away) and undersides are darkest. */
  dark: 0.68,
} as const

export type Point = { x: number; y: number }
export type Vec3 = { x: number; y: number; z: number }

/** Projects a world point to SVG user units. */
export function project(x: number, y: number, z = 0): Point {
  return {
    x: (x - y) * ISO_X,
    y: (x + y) * ISO_Y - z,
  }
}

/** Projects a world point given as an object. */
export function projectVec(v: Vec3): Point {
  return project(v.x, v.y, v.z)
}

/** `translate(...)` string placing an item's local origin at a world point. */
export function isoTranslate(x: number, y: number, z = 0): string {
  const p = project(x, y, z)
  return `translate(${round(p.x)} ${round(p.y)})`
}

/** Screen-space polygon for a flat rectangle on the floor (or any height z). */
export function floorQuad(
  x: number,
  y: number,
  w: number,
  d: number,
  z = 0,
): string {
  return points([
    project(x, y, z),
    project(x + w, y, z),
    project(x + w, y + d, z),
    project(x, y + d, z),
  ])
}

/** Screen-space polygon for the top face of a box. */
export function boxTop(o: Vec3, w: number, d: number, h: number): string {
  return floorQuad(o.x, o.y, w, d, o.z + h)
}

/** Screen-space polygon for the box face pointing toward the viewer (-y). */
export function boxFront(o: Vec3, w: number, d: number, h: number): string {
  return points([
    project(o.x, o.y + d, o.z + h),
    project(o.x + w, o.y + d, o.z + h),
    project(o.x + w, o.y + d, o.z),
    project(o.x, o.y + d, o.z),
  ])
}

/** Screen-space polygon for the box face pointing right (+x). */
export function boxSide(o: Vec3, w: number, d: number, h: number): string {
  return points([
    project(o.x + w, o.y, o.z + h),
    project(o.x + w, o.y + d, o.z + h),
    project(o.x + w, o.y + d, o.z),
    project(o.x + w, o.y, o.z),
  ])
}

/**
 * Painter's-algorithm depth key. Larger draws later (in front). Items further
 * forward (+y) and further right (+x) occlude those behind them; z only breaks
 * ties between things stacked at the same footprint.
 */
export function depth(v: Vec3): number {
  return v.x + v.y * 2 + v.z * 0.01
}

/** Serialises points for an SVG `points` attribute. */
export function points(ps: Point[]): string {
  return ps.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
