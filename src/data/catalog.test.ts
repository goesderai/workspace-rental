import { describe, expect, it } from 'vitest'
import { CATALOG, GROUPS, itemsIn } from './catalog'
import { SLOT_ACCEPTS, type SlotId } from '@/lib/slots'

describe('catalog invariants', () => {
  it('has unique ids', () => {
    const ids = CATALOG.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only lists slots that accept the item category', () => {
    for (const item of CATALOG) {
      expect(item.slots.length).toBeGreaterThan(0)
      for (const slot of item.slots) {
        expect(
          SLOT_ACCEPTS[slot as SlotId].includes(item.category),
          `${item.id} lists ${slot}, which does not accept ${item.category}`,
        ).toBe(true)
      }
    }
  })

  it('prices everything above zero', () => {
    for (const item of CATALOG) {
      expect(item.priceWeekly, item.id).toBeGreaterThan(0)
    }
  })

  it('gives every item real dimensions', () => {
    for (const item of CATALOG) {
      expect(item.size.w, item.id).toBeGreaterThan(0)
      expect(item.size.d, item.id).toBeGreaterThan(0)
      expect(item.size.h, item.id).toBeGreaterThan(0)
    }
  })

  it('offers at least two desks, as the brief requires', () => {
    expect(itemsIn('desk').length).toBeGreaterThanOrEqual(2)
  })

  it('puts every item in a group the rail renders', () => {
    const grouped = GROUPS.flatMap((g) => itemsIn(g.category))
    expect(grouped.length).toBe(CATALOG.length)
  })

  it('keeps the published monis.rent rates exact', () => {
    // These are the rates monis.rent actually advertises; they must not drift.
    const published: Record<string, number> = {
      'desk-electrical': 5,
      'chair-ergonomic': 6,
      'monitor-24': 6,
      'monitor-27': 13,
    }
    for (const [id, price] of Object.entries(published)) {
      const item = CATALOG.find((i) => i.id === id)!
      expect(item.priceWeekly, id).toBe(price)
      expect(item.estimated, `${id} is a published rate, not an estimate`).toBeUndefined()
    }
  })
})
