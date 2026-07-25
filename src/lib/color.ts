/** Multiplies a hex colour toward black. Used to shade isometric faces. */
export function shade(hex: string, factor: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = clamp((n >> 16) * factor)
  const g = clamp(((n >> 8) & 0xff) * factor)
  const b = clamp((n & 0xff) * factor)
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

/** Mixes a hex colour toward white. Used for highlights and glass. */
export function tint(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16)
  const mix = (c: number) => clamp(c + (255 - c) * amount)
  return `#${to2(mix(n >> 16))}${to2(mix((n >> 8) & 0xff))}${to2(mix(n & 0xff))}`
}

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function to2(n: number): string {
  return n.toString(16).padStart(2, '0')
}
