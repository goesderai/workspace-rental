/**
 * Rental maths. Pure functions over `WorkspaceState`.
 *
 * monis.rent charges by the week, so the week is the unit throughout and longer
 * commitments earn a lower weekly rate.
 */

import { entriesOf, type TermWeeks, type WorkspaceState } from './state'

/** Discount on the weekly rate for committing to a longer term. */
export const TERM_DISCOUNT: Record<TermWeeks, number> = {
  1: 0,
  4: 0.05,
  12: 0.12,
  24: 0.2,
}

export const TERM_LABEL: Record<TermWeeks, string> = {
  1: '1 week',
  4: '1 month',
  12: '3 months',
  24: '6 months',
}

/** Weeks of rental held as a returnable deposit. */
const DEPOSIT_WEEKS = 2

export type Quote = {
  /** Sum of list weekly prices, before any term discount. */
  listWeekly: number
  discountRate: number
  /** What you actually pay per week. */
  weekly: number
  /** Saved per week versus the 1-week rate. */
  savedWeekly: number
  termWeeks: TermWeeks
  /** Rental across the whole term, excluding the deposit. */
  termTotal: number
  /** Refundable, held for the duration. */
  deposit: number
  /** Charged today: first week plus deposit. */
  dueToday: number
  itemCount: number
}

export function quote(state: WorkspaceState): Quote {
  const items = entriesOf(state)
  const listWeekly = round(items.reduce((sum, [, item]) => sum + item.priceWeekly, 0))
  const discountRate = TERM_DISCOUNT[state.termWeeks]
  const weekly = round(listWeekly * (1 - discountRate))
  const deposit = round(weekly * DEPOSIT_WEEKS)

  return {
    listWeekly,
    discountRate,
    weekly,
    savedWeekly: round(listWeekly - weekly),
    termWeeks: state.termWeeks,
    termTotal: round(weekly * state.termWeeks),
    deposit,
    dueToday: round(weekly + deposit),
    itemCount: items.length,
  }
}

/**
 * Next delivery date. monis.rent delivers same day, but a setup booked now is
 * realistically dropped off the following day, and nobody delivers on Sunday.
 */
export function deliveryDate(from: Date = new Date()): Date {
  const d = new Date(from)
  d.setDate(d.getDate() + 1)
  if (d.getDay() === 0) d.setDate(d.getDate() + 1)
  return d
}

/** "Tue 28 Jul" — short enough to sit inline in the price bar. */
export function formatDeliveryDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function money(n: number): string {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
