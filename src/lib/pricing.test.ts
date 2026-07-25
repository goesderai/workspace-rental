import { describe, expect, it } from 'vitest'
import { deliveryDate, money, quote, TERM_DISCOUNT } from './pricing'
import { reducer, EMPTY, TERMS, type Action, type WorkspaceState } from './state'

/** The setup monis.rent advertises at $24/week: electric desk, chair, 27" 4K. */
function advertisedSetup(termWeeks: WorkspaceState['termWeeks'] = 1): WorkspaceState {
  const actions: Action[] = [
    { type: 'place', itemId: 'desk-electrical' },
    { type: 'place', itemId: 'chair-ergonomic' },
    { type: 'place', itemId: 'monitor-27' },
    { type: 'setTerm', termWeeks },
  ]
  return actions.reduce(reducer, EMPTY)
}

describe('quote', () => {
  it('matches the $24/week setup monis.rent advertises', () => {
    // $5 desk + $6 chair + $13 monitor, at the undiscounted weekly rate.
    const q = quote(advertisedSetup(1))
    expect(q.listWeekly).toBe(24)
    expect(q.weekly).toBe(24)
    expect(q.discountRate).toBe(0)
    expect(q.itemCount).toBe(3)
  })

  it('is all zeroes for an empty setup', () => {
    const q = quote(EMPTY)
    expect(q.listWeekly).toBe(0)
    expect(q.weekly).toBe(0)
    expect(q.dueToday).toBe(0)
    expect(q.itemCount).toBe(0)
  })

  it('applies the term discount to the weekly rate', () => {
    for (const weeks of TERMS) {
      const q = quote(advertisedSetup(weeks))
      expect(q.weekly).toBeCloseTo(24 * (1 - TERM_DISCOUNT[weeks]), 2)
      expect(q.savedWeekly).toBeCloseTo(24 - q.weekly, 2)
    }
  })

  it('charges the term total, the deposit and today from the discounted rate', () => {
    const q = quote(advertisedSetup(12))
    expect(q.weekly).toBeCloseTo(21.12, 2) // 24 less 12%
    expect(q.termTotal).toBeCloseTo(21.12 * 12, 2)
    expect(q.deposit).toBeCloseTo(21.12 * 2, 2)
    expect(q.dueToday).toBeCloseTo(q.weekly + q.deposit, 2)
  })

  it('gets cheaper per week as the term gets longer', () => {
    const rates = TERMS.map((weeks) => quote(advertisedSetup(weeks)).weekly)
    const sorted = [...rates].sort((a, b) => b - a)
    expect(rates).toEqual(sorted)
  })

  it('counts a duplicated item once per slot', () => {
    const actions: Action[] = [
      { type: 'place', itemId: 'desk-electrical' },
      { type: 'place', itemId: 'monitor-24', slot: 'MON_L' },
      { type: 'place', itemId: 'monitor-24', slot: 'MON_R' },
    ]
    const twoMonitors = actions.reduce(reducer, EMPTY)

    // $5 desk plus two $6 monitors.
    expect(quote(twoMonitors).listWeekly).toBe(17)
  })
})

describe('deliveryDate', () => {
  it('is the next day', () => {
    const friday = new Date('2026-07-24T09:00:00Z')
    expect(deliveryDate(friday).getDate()).toBe(25)
  })

  it('skips Sunday', () => {
    const saturday = new Date('2026-07-25T09:00:00Z')
    const d = deliveryDate(saturday)
    expect(d.getDay()).not.toBe(0)
    expect(d.getDate()).toBe(27) // Monday
  })
})

describe('money', () => {
  it('drops the decimals on whole amounts and keeps cents otherwise', () => {
    expect(money(24)).toBe('$24')
    expect(money(21.12)).toBe('$21.12')
    expect(money(0.5)).toBe('$0.50')
  })
})
