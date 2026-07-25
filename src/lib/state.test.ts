import { describe, expect, it } from 'vitest'
import { EMPTY, canPlace, countOf, reducer, type WorkspaceState } from './state'
import { getItem } from '@/data/catalog'

/** Convenience: apply a list of actions in order, starting from empty. */
function run(...actions: Parameters<typeof reducer>[1][]): WorkspaceState {
  return actions.reduce(reducer, EMPTY)
}

describe('placing items', () => {
  it('puts a desk in the desk slot', () => {
    const s = run({ type: 'place', itemId: 'desk-electrical' })
    expect(s.placements.DESK).toBe('desk-electrical')
  })

  it('fills the first free slot when no slot is named', () => {
    const s = run(
      { type: 'place', itemId: 'desk-electrical' },
      { type: 'place', itemId: 'monitor-24' },
      { type: 'place', itemId: 'monitor-24' },
    )
    // monitor-24 lists MON_C first, then MON_L.
    expect(s.placements.MON_C).toBe('monitor-24')
    expect(s.placements.MON_L).toBe('monitor-24')
    expect(countOf(s, 'monitor-24')).toBe(2)
  })

  it('replaces the item already in a named slot', () => {
    const s = run(
      { type: 'place', itemId: 'desk-electrical' },
      { type: 'place', itemId: 'monitor-24', slot: 'MON_C' },
      { type: 'place', itemId: 'monitor-27', slot: 'MON_C' },
    )
    expect(s.placements.MON_C).toBe('monitor-27')
  })

  it('refuses to put anything on a desk that is not there', () => {
    const s = run({ type: 'place', itemId: 'monitor-24' })
    expect(s.placements).toEqual({})
  })

  it('refuses a slot the item does not list', () => {
    // The 34" ultrawide only fits the centre slot.
    const s = run(
      { type: 'place', itemId: 'desk-electrical' },
      { type: 'place', itemId: 'monitor-34', slot: 'MON_L' },
    )
    expect(s.placements.MON_L).toBeUndefined()
  })

  it('refuses a slot that does not accept the category', () => {
    const s = run(
      { type: 'place', itemId: 'desk-electrical' },
      { type: 'place', itemId: 'rug-jute', slot: 'MON_C' },
    )
    expect(s.placements.MON_C).toBeUndefined()
  })

  it('ignores unknown item ids', () => {
    const s = run({ type: 'place', itemId: 'no-such-thing' })
    expect(s).toBe(EMPTY)
  })

  it('returns the same state when placing what is already there', () => {
    const a = run({ type: 'place', itemId: 'desk-electrical' })
    const b = reducer(a, { type: 'place', itemId: 'desk-electrical', slot: 'DESK' })
    expect(b).toBe(a)
  })
})

describe('removing items', () => {
  it('removing the desk takes its mounted items with it', () => {
    const withDesk = run(
      { type: 'place', itemId: 'desk-electrical' },
      { type: 'place', itemId: 'monitor-27', slot: 'MON_C' },
      { type: 'place', itemId: 'keyboard-mx', slot: 'SURFACE' },
      { type: 'place', itemId: 'desk-lamp', slot: 'DESK_L' },
      { type: 'place', itemId: 'chair-ergonomic' },
      { type: 'place', itemId: 'rug-jute' },
    )
    const after = reducer(withDesk, { type: 'remove', slot: 'DESK' })

    expect(after.placements.MON_C).toBeUndefined()
    expect(after.placements.SURFACE).toBeUndefined()
    expect(after.placements.DESK_L).toBeUndefined()
    // Things standing on the floor are unaffected.
    expect(after.placements.CHAIR).toBe('chair-ergonomic')
    expect(after.placements.RUG).toBe('rug-jute')
  })

  it('is a no-op on an empty slot', () => {
    const a = run({ type: 'place', itemId: 'desk-electrical' })
    expect(reducer(a, { type: 'remove', slot: 'MON_C' })).toBe(a)
  })
})

describe('term and reset', () => {
  it('keeps the chosen term through a reset', () => {
    const s = run(
      { type: 'place', itemId: 'desk-electrical' },
      { type: 'setTerm', termWeeks: 24 },
      { type: 'reset' },
    )
    expect(s.placements).toEqual({})
    expect(s.termWeeks).toBe(24)
  })
})

describe('canPlace', () => {
  it('blocks desk-only items until a desk exists', () => {
    const monitor = getItem('monitor-27')!
    expect(canPlace(EMPTY, monitor)).toBe(false)
    expect(canPlace(run({ type: 'place', itemId: 'desk-electrical' }), monitor)).toBe(true)
  })

  it('always allows floor items', () => {
    expect(canPlace(EMPTY, getItem('rug-jute')!)).toBe(true)
    expect(canPlace(EMPTY, getItem('chair-ergonomic')!)).toBe(true)
  })
})
