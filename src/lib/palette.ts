/**
 * The scene palette, as literal hex so the shading maths in `color.ts` can work
 * on it. These values are mirrored as CSS custom properties in `globals.css`
 * for everything outside the SVG.
 */
export const PALETTE = {
  paper: '#EFEDE4',
  grid: '#D6D8CB',
  ink: '#1B2B34',
  teak: '#AE7549',
  surf: '#0F8B8D',
  sun: '#F2C14E',
  /** Neutrals used inside the artwork itself. */
  steel: '#8A98A0',
  slate: '#3D5561',
  linen: '#D9D4C5',
  leaf: '#4E8A5B',
} as const

export type PaletteKey = keyof typeof PALETTE
