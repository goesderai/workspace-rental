import { describe, expect, it } from 'vitest'
import { decodeState, encodeState, toQuery } from './urlState'
import { EMPTY, reducer, type WorkspaceState } from './state'

function build(...actions: Parameters<typeof reducer>[1][]): WorkspaceState {
  return actions.reduce(reducer, EMPTY)
}

const fullSetup = build(
  { type: 'place', itemId: 'desk-electrical' },
  { type: 'place', itemId: 'chair-ergonomic' },
  { type: 'place', itemId: 'monitor-27', slot: 'MON_C' },
  { type: 'place', itemId: 'monitor-24', slot: 'MON_L' },
  { type: 'place', itemId: 'keyboard-mx', slot: 'SURFACE' },
  { type: 'place', itemId: 'desk-lamp', slot: 'DESK_L' },
  { type: 'place', itemId: 'plant-monstera', slot: 'FLOOR_L' },
  { type: 'place', itemId: 'rug-jute' },
  { type: 'setTerm', termWeeks: 24 },
)

describe('round trip', () => {
  it('restores a full setup exactly', () => {
    expect(decodeState(encodeState(fullSetup))).toEqual(fullSetup)
  })

  it('restores an empty setup', () => {
    expect(decodeState(encodeState(EMPTY))).toEqual(EMPTY)
  })

  it('survives being passed through a real query string', () => {
    const params = new URLSearchParams(toQuery(fullSetup).slice(1))
    const decoded = decodeState({
      s: params.get('s') ?? undefined,
      t: params.get('t') ?? undefined,
    })
    expect(decoded).toEqual(fullSetup)
  })

  it('produces no payload for an empty setup', () => {
    expect(toQuery(EMPTY)).toBe('?t=4')
  })
})

describe('decoding untrusted input', () => {
  it('ignores unknown slot codes and unknown item ids', () => {
    const decoded = decodeState({
      s: 'd:desk-electrical_zz:monitor-27_mc:not-a-real-item',
      t: '4',
    })
    expect(decoded.placements).toEqual({ DESK: 'desk-electrical' })
  })

  it('falls back to the default term when the term is nonsense', () => {
    expect(decodeState({ s: '', t: '999' }).termWeeks).toBe(EMPTY.termWeeks)
    expect(decodeState({ s: '', t: 'abc' }).termWeeks).toBe(EMPTY.termWeeks)
    expect(decodeState({}).termWeeks).toBe(EMPTY.termWeeks)
  })

  it('drops desk-mounted items when the payload has no desk', () => {
    const decoded = decodeState({
      s: 'mc:monitor-27_s:keyboard-mx_dl:desk-lamp_c:chair-ergonomic_r:rug-jute',
      t: '4',
    })
    // Nothing may float where a desk should be.
    expect(decoded.placements.MON_C).toBeUndefined()
    expect(decoded.placements.SURFACE).toBeUndefined()
    expect(decoded.placements.DESK_L).toBeUndefined()
    // Floor-standing items are still honoured.
    expect(decoded.placements.CHAIR).toBe('chair-ergonomic')
    expect(decoded.placements.RUG).toBe('rug-jute')
  })

  it('tolerates malformed entries', () => {
    const decoded = decodeState({ s: '__:_d:desk-electrical_:_x', t: '4' })
    expect(decoded.placements).toEqual({ DESK: 'desk-electrical' })
  })
})
