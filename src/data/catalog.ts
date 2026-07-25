/**
 * The rentable catalog.
 *
 * Product names are the real monis.rent listings. Prices are weekly in USD,
 * which is how monis.rent actually rents. Where a weekly price is published we
 * use it exactly:
 *
 *   Electrical Adjustable Desk        $5/week
 *   Ergonomic Office Chair            $6/week
 *   24" Full HD Office Monitor        $6/week
 *   27" 4K Multimedia Monitor        $13/week
 *   Smart Power Strip              $0.50/week
 *
 * (monis.rent advertises those three together as a $24/week setup.) Prices for
 * items whose rate is not published are set in line with the published ones and
 * flagged with `estimated`, so nothing here silently invents a real quote.
 */

import type { ComponentType } from 'react'
import type { Category, Footprint, SlotId } from '@/lib/slots'
import { DeskMechanical, DeskElectrical } from '@/components/items/desks'
import { ChairErgonomic, ChairTeak } from '@/components/items/seating'
import {
  Monitor24,
  Monitor27,
  MonitorUltrawide,
  StudioDisplay,
} from '@/components/items/displays'
import {
  DeskLamp,
  PlantMonstera,
  PlantDesk,
  Keyboard,
  LaptopStand,
  Mug,
  RugJute,
} from '@/components/items/accessories'
import {
  Surfboard,
  Scooter,
  CoffeeMachine,
  BeanBag,
  Fan,
} from '@/components/items/extras'

export type Item = {
  id: string
  name: string
  category: Category
  /** USD per week. */
  priceWeekly: number
  /** True when monis.rent does not publish this rate and we set it in line. */
  estimated?: boolean
  /** Slots this item may occupy, in fill order. */
  slots: SlotId[]
  /** Real size in centimetres, shown in the dimension callout. */
  size: Footprint
  Art: ComponentType
  /** One short line, in the interface's voice, for the catalog card. */
  note?: string
}

export const CATALOG: Item[] = [
  // ---- Desks -------------------------------------------------------------
  {
    id: 'desk-mechanical',
    name: 'Mechanical Adjustable Desk',
    category: 'desk',
    priceWeekly: 4,
    estimated: true,
    slots: ['DESK'],
    size: { w: 140, d: 70, h: 74 },
    Art: DeskMechanical,
    note: 'Hand crank. Teak top, 140cm.',
  },
  {
    id: 'desk-electrical',
    name: 'Electrical Adjustable Desk',
    category: 'desk',
    priceWeekly: 5,
    slots: ['DESK'],
    size: { w: 180, d: 75, h: 78 },
    Art: DeskElectrical,
    note: 'Sit-stand at the press of a button. 180cm.',
  },

  // ---- Seating -----------------------------------------------------------
  {
    id: 'chair-ergonomic',
    name: 'Ergonomic Office Chair',
    category: 'chair',
    priceWeekly: 6,
    slots: ['CHAIR'],
    size: { w: 62, d: 62, h: 105 },
    Art: ChairErgonomic,
    note: 'Mesh back, adjustable arms.',
  },
  {
    id: 'chair-teak',
    name: 'Teak Workshop Chair',
    category: 'chair',
    priceWeekly: 3,
    estimated: true,
    slots: ['CHAIR'],
    size: { w: 42, d: 40, h: 93 },
    Art: ChairTeak,
    note: 'Made up the road in Gianyar.',
  },

  // ---- Displays ----------------------------------------------------------
  {
    id: 'monitor-24',
    name: '24" Full HD Office Monitor',
    category: 'monitor',
    priceWeekly: 6,
    slots: ['MON_C', 'MON_L', 'MON_R'],
    size: { w: 53, d: 18, h: 42 },
    Art: Monitor24,
    note: 'The one that just gets the job done.',
  },
  {
    id: 'monitor-27',
    name: '27" 4K Multimedia Monitor',
    category: 'monitor',
    priceWeekly: 13,
    slots: ['MON_C', 'MON_L', 'MON_R'],
    size: { w: 60, d: 20, h: 48 },
    Art: Monitor27,
    note: '4K, so the type stays sharp.',
  },
  {
    id: 'monitor-34',
    name: '34" 4K Gaming Monitor',
    category: 'monitor',
    priceWeekly: 18,
    estimated: true,
    slots: ['MON_C'],
    size: { w: 81, d: 22, h: 50 },
    Art: MonitorUltrawide,
    note: 'Curved ultrawide. Takes the centre slot.',
  },
  {
    id: 'display-studio',
    name: '27" 5K Apple Studio Display',
    category: 'monitor',
    priceWeekly: 22,
    estimated: true,
    slots: ['MON_C', 'MON_L', 'MON_R'],
    size: { w: 60, d: 19, h: 48 },
    Art: StudioDisplay,
    note: '5K aluminium. Pairs with a Mac.',
  },

  // ---- On the desk -------------------------------------------------------
  {
    id: 'laptop-stand',
    name: 'Ergonomic Laptop Stand',
    category: 'peripheral',
    priceWeekly: 2,
    estimated: true,
    slots: ['SURFACE'],
    size: { w: 34, d: 24, h: 38 },
    Art: LaptopStand,
    note: 'Lifts your screen to eye level.',
  },
  {
    id: 'keyboard-mx',
    name: 'Logitech MX Keyboard',
    category: 'peripheral',
    priceWeekly: 3,
    estimated: true,
    slots: ['SURFACE'],
    size: { w: 44, d: 15, h: 2 },
    Art: Keyboard,
    note: 'Low profile, backlit, quiet.',
  },
  {
    id: 'desk-lamp',
    name: 'Architect Desk Lamp',
    category: 'lighting',
    priceWeekly: 2,
    estimated: true,
    slots: ['DESK_L', 'DESK_R'],
    size: { w: 16, d: 16, h: 40 },
    Art: DeskLamp,
    note: 'Warm, aimed where you need it.',
  },
  {
    id: 'plant-desk',
    name: 'Desk Succulent',
    category: 'greenery',
    priceWeekly: 1,
    estimated: true,
    slots: ['DESK_R', 'DESK_L'],
    size: { w: 14, d: 14, h: 19 },
    Art: PlantDesk,
    note: 'Survives being forgotten.',
  },
  {
    id: 'mug',
    name: 'Monis Enamel Mug',
    category: 'peripheral',
    priceWeekly: 0.5,
    estimated: true,
    slots: ['DESK_L', 'DESK_R'],
    size: { w: 8, d: 8, h: 9 },
    Art: Mug,
    note: 'Yours to keep the coffee in.',
  },

  // ---- On the floor ------------------------------------------------------
  {
    id: 'plant-monstera',
    name: 'Monstera in Terracotta',
    category: 'greenery',
    priceWeekly: 2,
    estimated: true,
    slots: ['FLOOR_L', 'FLOOR_R'],
    size: { w: 44, d: 44, h: 82 },
    Art: PlantMonstera,
    note: 'Big leaves. Instant softening.',
  },
  {
    id: 'rug-jute',
    name: 'Jute Floor Rug',
    category: 'floor',
    priceWeekly: 2,
    estimated: true,
    slots: ['RUG'],
    size: { w: 190, d: 150, h: 1 },
    Art: RugJute,
    note: 'Warms up a tiled villa floor.',
  },

  // ---- Bali extras -------------------------------------------------------
  {
    id: 'fan',
    name: 'Standing Fan',
    category: 'extras',
    priceWeekly: 2,
    estimated: true,
    slots: ['FLOOR_R', 'FLOOR_L'],
    size: { w: 34, d: 34, h: 115 },
    Art: Fan,
    note: 'For the 30-degree afternoons.',
  },
  {
    id: 'coffee-machine',
    name: 'Espresso Machine',
    category: 'extras',
    priceWeekly: 7,
    estimated: true,
    slots: ['FLOOR_L', 'FLOOR_R'],
    size: { w: 28, d: 26, h: 42 },
    Art: CoffeeMachine,
    note: 'Skip the 9am cafe queue.',
  },
  {
    id: 'bean-bag',
    name: 'Bean Bag',
    category: 'extras',
    priceWeekly: 4,
    estimated: true,
    slots: ['FLOOR_L', 'FLOOR_R'],
    size: { w: 80, d: 80, h: 65 },
    Art: BeanBag,
    note: 'For the part of the day that is not work.',
  },
  {
    id: 'surfboard',
    name: 'Surfboard',
    category: 'extras',
    priceWeekly: 9,
    estimated: true,
    slots: ['FLOOR_L', 'FLOOR_R'],
    size: { w: 50, d: 8, h: 180 },
    Art: Surfboard,
    note: 'Dawn patrol, then standup.',
  },
  {
    id: 'scooter',
    name: 'Scooter',
    category: 'extras',
    priceWeekly: 14,
    estimated: true,
    slots: ['FLOOR_L', 'FLOOR_R'],
    size: { w: 175, d: 65, h: 105 },
    Art: Scooter,
    note: 'How everyone actually gets around.',
  },
]

const BY_ID = new Map(CATALOG.map((i) => [i.id, i]))

export function getItem(id: string): Item | undefined {
  return BY_ID.get(id)
}

/** Catalog groups, in the order the rail presents them. */
export const GROUPS: { category: Category; label: string; hint: string }[] = [
  { category: 'desk', label: 'Desks', hint: 'Start here — everything else sits on it.' },
  { category: 'chair', label: 'Seating', hint: 'What you will spend eight hours in.' },
  { category: 'monitor', label: 'Displays', hint: 'Up to three across the back edge.' },
  { category: 'peripheral', label: 'Desk kit', hint: 'Keyboard, stand, and the mug.' },
  { category: 'lighting', label: 'Lighting', hint: 'For working past sunset.' },
  { category: 'greenery', label: 'Greenery', hint: 'Softens a bare villa room.' },
  { category: 'floor', label: 'Floor', hint: 'Under the whole setup.' },
  { category: 'extras', label: 'Bali extras', hint: 'The reason you came here.' },
]

export function itemsIn(category: Category): Item[] {
  return CATALOG.filter((i) => i.category === category)
}
