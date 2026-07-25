import type { Item } from '@/data/catalog'

/**
 * A catalog thumbnail drawn from the same artwork as the stage — no separate
 * icon set to keep in sync, and what you pick is literally what you get.
 *
 * The view box is derived from the item's real dimensions: an isometric box of
 * w×d×h spans (w+d)·cos30 across and h + (w+d)·sin30 vertically.
 */
export function ItemThumb({ item, size = 56 }: { item: Item; size?: number }) {
  const { w, d, h } = item.size
  const halfSpan = ((w + d) / 2) * 0.866
  const bottom = ((w + d) / 2) * 0.5
  const margin = Math.max(6, (w + d) * 0.06)

  const minX = -halfSpan - margin
  const width = 2 * (halfSpan + margin)
  const minY = -h - margin
  const height = h + bottom + 2 * margin

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${minX} ${minY} ${width} ${height}`}
      aria-hidden="true"
      className="block"
    >
      <item.Art />
    </svg>
  )
}
