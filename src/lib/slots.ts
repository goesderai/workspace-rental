/**
 * Slots are the named places an item can occupy in the scene.
 *
 * Anchors are not constants: they are derived from whichever desk is currently
 * selected, so swapping a 120cm desk for a 180cm standing desk moves the
 * monitors, lamp and keyboard with it instead of leaving them floating.
 */

import type { Vec3 } from './iso'

export const ROOM = { w: 320, d: 260 } as const

export type SlotId =
  | 'RUG'
  | 'DESK'
  | 'CHAIR'
  | 'MON_L'
  | 'MON_C'
  | 'MON_R'
  | 'DESK_L'
  | 'DESK_R'
  | 'SURFACE'
  | 'FLOOR_L'
  | 'FLOOR_R'

export type Category =
  | 'desk'
  | 'chair'
  | 'monitor'
  | 'lighting'
  | 'greenery'
  | 'peripheral'
  | 'floor'
  | 'extras'

/** Real dimensions in centimetres, used for both layout and dimension callouts. */
export type Footprint = { w: number; d: number; h: number }

export const SLOT_ORDER: SlotId[] = [
  'RUG',
  'FLOOR_L',
  'FLOOR_R',
  'DESK',
  'MON_L',
  'MON_C',
  'MON_R',
  'DESK_L',
  'DESK_R',
  'SURFACE',
  'CHAIR',
]

/** Which categories each slot will accept. Drives drop-target highlighting. */
export const SLOT_ACCEPTS: Record<SlotId, Category[]> = {
  RUG: ['floor'],
  DESK: ['desk'],
  CHAIR: ['chair'],
  MON_L: ['monitor'],
  MON_C: ['monitor'],
  MON_R: ['monitor'],
  DESK_L: ['lighting', 'greenery', 'peripheral'],
  DESK_R: ['lighting', 'greenery', 'peripheral'],
  SURFACE: ['peripheral'],
  FLOOR_L: ['greenery', 'extras'],
  FLOOR_R: ['greenery', 'extras'],
}

/** Human labels for the architect's callouts. */
export const SLOT_LABELS: Record<SlotId, string> = {
  RUG: 'Floor',
  DESK: 'Desk',
  CHAIR: 'Seating',
  MON_L: 'Left display',
  MON_C: 'Centre display',
  MON_R: 'Right display',
  DESK_L: 'Desk left',
  DESK_R: 'Desk right',
  SURFACE: 'Work surface',
  FLOOR_L: 'Floor left',
  FLOOR_R: 'Floor right',
}

/** Where the desk sits. Everything else is positioned relative to it. */
function deskOrigin(fp: Footprint): Vec3 {
  return { x: (ROOM.w - fp.w) / 2, y: 64, z: 0 }
}

/**
 * Anchor points for the given desk. When no desk is selected we still return a
 * usable set based on a default footprint, so the empty stage can show its
 * ghosted slot outlines in the right places.
 */
export function anchorsFor(fp: Footprint | null): Record<SlotId, Vec3> {
  const desk = fp ?? { w: 140, d: 70, h: 74 }
  const o = deskOrigin(desk)
  const top = o.z + desk.h
  const cx = o.x + desk.w / 2

  return {
    RUG: { x: ROOM.w / 2, y: 150, z: 0 },
    // Every anchor is where the item's own local origin lands, and each item is
    // authored around the centre of its footprint at floor level.
    DESK: { x: cx, y: o.y + desk.d / 2, z: 0 },
    // Tucked in far enough to overlap the desk, which is what reads as "pulled
    // up to it" rather than "parked beside it".
    CHAIR: { x: cx, y: o.y + desk.d + 6, z: 0 },

    /*
     * Displays line up along the back edge. The side slots sit close to the
     * desk edges because three 53-60cm panels genuinely do not fit on a 140cm
     * desk otherwise — a real triple setup angles them in until they touch.
     */
    MON_L: { x: o.x + desk.w * 0.17, y: o.y + 17, z: top },
    MON_C: { x: cx, y: o.y + 14, z: top },
    MON_R: { x: o.x + desk.w * 0.83, y: o.y + 17, z: top },

    // Corners of the desktop, mid-depth.
    DESK_L: { x: o.x + 16, y: o.y + desk.d * 0.42, z: top },
    DESK_R: { x: o.x + desk.w - 16, y: o.y + desk.d * 0.42, z: top },

    // Front-centre of the desktop, where hands actually go.
    SURFACE: { x: cx, y: o.y + desk.d - 20, z: top },

    FLOOR_L: { x: o.x - 46, y: o.y + desk.d - 6, z: 0 },
    FLOOR_R: { x: o.x + desk.w + 46, y: o.y + desk.d - 6, z: 0 },
  }
}

/** Slots that only make sense once a desk exists. */
export const DESK_DEPENDENT: SlotId[] = [
  'MON_L',
  'MON_C',
  'MON_R',
  'DESK_L',
  'DESK_R',
  'SURFACE',
]

export function slotsFor(category: Category): SlotId[] {
  return (Object.keys(SLOT_ACCEPTS) as SlotId[]).filter((s) =>
    SLOT_ACCEPTS[s].includes(category),
  )
}
