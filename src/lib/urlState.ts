/**
 * Encodes a setup into the URL and back.
 *
 * The payload stays human-readable rather than base64 — a shared link should
 * look like a plan, and it makes a mangled link obvious instead of silently
 * decoding to nonsense. Item ids are used directly (never catalog indexes) so
 * links keep working when the catalog changes.
 *
 *   ?s=d:desk-electrical_mc:monitor-27_c:chair-ergonomic&t=12
 */

import type { SlotId } from './slots'
import { EMPTY, TERMS, type TermWeeks, type WorkspaceState } from './state'
import { getItem } from '@/data/catalog'

const SLOT_CODE: Record<SlotId, string> = {
  RUG: 'r',
  DESK: 'd',
  CHAIR: 'c',
  MON_L: 'ml',
  MON_C: 'mc',
  MON_R: 'mr',
  DESK_L: 'dl',
  DESK_R: 'dr',
  SURFACE: 's',
  FLOOR_L: 'fl',
  FLOOR_R: 'fr',
}

const CODE_SLOT = new Map(
  (Object.entries(SLOT_CODE) as [SlotId, string][]).map(([slot, code]) => [code, slot]),
)

export type UrlParts = { s?: string; t?: string }

export function encodeState(state: WorkspaceState): UrlParts {
  const s = (Object.entries(state.placements) as [SlotId, string][])
    .map(([slot, itemId]) => `${SLOT_CODE[slot]}:${itemId}`)
    .join('_')

  return { s: s || undefined, t: String(state.termWeeks) }
}

/** Decodes a payload, ignoring anything unrecognised rather than throwing. */
export function decodeState(parts: UrlParts): WorkspaceState {
  const placements: Partial<Record<SlotId, string>> = {}

  for (const entry of (parts.s ?? '').split('_')) {
    if (!entry) continue
    const at = entry.indexOf(':')
    if (at < 1) continue

    const slot = CODE_SLOT.get(entry.slice(0, at))
    const itemId = entry.slice(at + 1)
    if (!slot || !getItem(itemId)) continue
    placements[slot] = itemId
  }

  // A setup whose desk did not survive decoding cannot keep its desk-mounted
  // items, so rebuild through the same rules the reducer uses.
  return {
    placements: placements.DESK ? placements : stripDeskDependent(placements),
    termWeeks: parseTerm(parts.t),
  }
}

function stripDeskDependent(
  placements: Partial<Record<SlotId, string>>,
): Partial<Record<SlotId, string>> {
  const out = { ...placements }
  for (const slot of ['MON_L', 'MON_C', 'MON_R', 'DESK_L', 'DESK_R', 'SURFACE'] as SlotId[]) {
    delete out[slot]
  }
  return out
}

function parseTerm(raw: string | undefined): TermWeeks {
  const n = Number(raw)
  return (TERMS as readonly number[]).includes(n) ? (n as TermWeeks) : EMPTY.termWeeks
}

/** Query string for a setup, ready to append to a path. */
export function toQuery(state: WorkspaceState): string {
  const { s, t } = encodeState(state)
  const params = new URLSearchParams()
  if (s) params.set('s', s)
  if (t) params.set('t', t)
  const q = params.toString()
  return q ? `?${q}` : ''
}
