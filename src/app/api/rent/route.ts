import { NextResponse } from 'next/server'
import { decodeState } from '@/lib/urlState'
import { deliveryDate, formatDeliveryDate, quote } from '@/lib/pricing'
import { isEmpty } from '@/lib/state'

/**
 * Stands in for placing a real rental order.
 *
 * The setup arrives as the same query payload the builder puts in the URL, and
 * the quote is recomputed here rather than trusted from the client — a price
 * should never be whatever the caller says it is.
 */
export async function POST(request: Request) {
  let body: { s?: string; t?: string; name?: string; area?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Expected a JSON body.' }, { status: 400 })
  }

  const state = decodeState({ s: body.s, t: body.t })
  if (isEmpty(state)) {
    return NextResponse.json(
      { error: 'That setup is empty. Add a desk before renting.' },
      { status: 422 },
    )
  }

  const q = quote(state)
  const delivery = deliveryDate()

  return NextResponse.json({
    orderId: newOrderId(),
    weekly: q.weekly,
    dueToday: q.dueToday,
    deposit: q.deposit,
    termWeeks: q.termWeeks,
    itemCount: q.itemCount,
    deliveryDate: delivery.toISOString(),
    deliveryLabel: formatDeliveryDate(delivery),
    area: body.area ?? 'Bali',
  })
}

/** Short, readable reference in the shape a customer could quote on WhatsApp. */
function newOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 5; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `MR-${out}`
}
