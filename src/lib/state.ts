/**
 * Workspace state and its reducer.
 *
 * Deliberately free of React so the rules can be tested directly. The whole
 * setup is one map from slot to item id, plus the rental term.
 */

import { DESK_DEPENDENT, SLOT_ACCEPTS, type SlotId } from './slots'
import { getItem, type Item } from '@/data/catalog'

export const TERMS = [1, 4, 12, 24] as const
export type TermWeeks = (typeof TERMS)[number]

export type WorkspaceState = {
  /** Slot to item id. A slot holds at most one item. */
  placements: Partial<Record<SlotId, string>>
  termWeeks: TermWeeks
}

export const EMPTY: WorkspaceState = { placements: {}, termWeeks: 4 }

export type Action =
  | { type: 'place'; itemId: string; slot?: SlotId }
  | { type: 'remove'; slot: SlotId }
  | { type: 'setTerm'; termWeeks: TermWeeks }
  | { type: 'reset' }
  | { type: 'load'; state: WorkspaceState }

export function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case 'place':
      return place(state, action.itemId, action.slot)

    case 'remove': {
      if (!state.placements[action.slot]) return state
      const placements = { ...state.placements }
      delete placements[action.slot]
      // Losing the desk takes everything that was standing on it.
      if (action.slot === 'DESK') {
        for (const s of DESK_DEPENDENT) delete placements[s]
      }
      return { ...state, placements }
    }

    case 'setTerm':
      return state.termWeeks === action.termWeeks
        ? state
        : { ...state, termWeeks: action.termWeeks }

    case 'reset':
      return { ...EMPTY, termWeeks: state.termWeeks }

    case 'load':
      return action.state
  }
}

/**
 * Places an item. With no slot given, fills the first free slot the item
 * accepts, and otherwise replaces whatever is in its first slot — which is what
 * makes a single click on a catalog card do the obvious thing.
 */
function place(
  state: WorkspaceState,
  itemId: string,
  slot?: SlotId,
): WorkspaceState {
  const item = getItem(itemId)
  if (!item) return state

  const target = slot ?? firstOpenSlot(state, item) ?? item.slots[0]
  if (!target || !item.slots.includes(target)) return state
  if (!SLOT_ACCEPTS[target].includes(item.category)) return state
  // Nothing may sit on a desk that is not there yet.
  if (DESK_DEPENDENT.includes(target) && !state.placements.DESK) return state
  if (state.placements[target] === itemId) return state

  return { ...state, placements: { ...state.placements, [target]: itemId } }
}

function firstOpenSlot(state: WorkspaceState, item: Item): SlotId | undefined {
  return item.slots.find((s) => !state.placements[s])
}

/** Whether this item can currently be added at all. */
export function canPlace(state: WorkspaceState, item: Item): boolean {
  if (item.slots.every((s) => DESK_DEPENDENT.includes(s))) {
    return Boolean(state.placements.DESK)
  }
  return true
}

/** How many of this item are in the setup right now. */
export function countOf(state: WorkspaceState, itemId: string): number {
  return Object.values(state.placements).filter((id) => id === itemId).length
}

export function deskItem(state: WorkspaceState): Item | undefined {
  const id = state.placements.DESK
  return id ? getItem(id) : undefined
}

/** Every placement as [slot, item] pairs, skipping ids no longer in the catalog. */
export function entriesOf(state: WorkspaceState): [SlotId, Item][] {
  return (Object.entries(state.placements) as [SlotId, string][])
    .map(([slot, id]) => [slot, getItem(id)] as [SlotId, Item | undefined])
    .filter((pair): pair is [SlotId, Item] => Boolean(pair[1]))
}

export function isEmpty(state: WorkspaceState): boolean {
  return Object.keys(state.placements).length === 0
}
