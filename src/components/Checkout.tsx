'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { SLOT_LABELS, SLOT_ORDER } from '@/lib/slots'
import { entriesOf, isEmpty, TERMS, type WorkspaceState } from '@/lib/state'
import {
  TERM_LABEL,
  deliveryDate,
  formatDeliveryDate,
  money,
  quote,
} from '@/lib/pricing'
import { encodeState, toQuery } from '@/lib/urlState'
import { ItemThumb } from './ItemThumb'
import StaticStage from './StaticStage'

const AREAS = ['Canggu', 'Uluwatu', 'Ubud', 'Sanur', 'Seminyak']

type Order = {
  orderId: string
  weekly: number
  dueToday: number
  deposit: number
  termWeeks: number
  deliveryLabel: string
  area: string
  name: string
  phone: string
}

/** A line of the money breakdown. */
function Row({
  label,
  value,
  note,
  strong,
  accent,
}: {
  label: string
  value: string
  note?: string
  strong?: boolean
  accent?: boolean
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-2 ${
        strong ? 'border-t border-ink' : 'border-t border-rule'
      }`}
    >
      <dt className={strong ? 'font-semibold' : 'text-muted'}>
        {label}
        {note && <span className="ml-2 text-xs text-muted">{note}</span>}
      </dt>
      <dd
        className={`num shrink-0 ${strong ? 'text-lg font-semibold' : ''} ${
          accent ? 'text-surf' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

export default function Checkout({ state }: { state: WorkspaceState }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [area, setArea] = useState(AREAS[0])
  const [detail, setDetail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const q = quote(state)
  const placed = new Map(entriesOf(state))
  const order_ = SLOT_ORDER.filter((s) => placed.has(s))
  const delivery = formatDeliveryDate(deliveryDate())

  if (isEmpty(state)) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="display text-3xl">Nothing to rent yet</h1>
        <p className="mt-3 text-sm text-muted">
          This link does not contain a setup. Start a plan and add a desk.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-surf"
        >
          Plan a workspace
        </Link>
      </div>
    )
  }

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      setError('Add your name and phone number so we can reach you on delivery.')
      return
    }
    setPending(true)
    setError(null)
    try {
      const { s, t } = encodeState(state)
      const fullArea = detail.trim() ? `${area} — ${detail.trim()}` : area
      const res = await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s, t, area: fullArea, name: name.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'That did not go through. Try again.')
        return
      }
      setOrder(data as Order)
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setPending(false)
    }
  }

  if (order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl px-6 py-16"
      >
        <p className="eyebrow">Booked</p>
        <h1 className="display mt-2 text-4xl">
          Your workspace is on its way.
        </h1>
        <p className="mt-4 text-sm text-muted">
          We deliver, assemble and take it away again at the end. Nothing to carry.
        </p>

        <dl className="mt-8 text-sm">
          <Row label="Reference" value={order.orderId} />
          <Row label="Contact" value={`${order.name}, ${order.phone}`} />
          <Row label="Arrives" value={`${order.deliveryLabel}, ${order.area}`} />
          <Row label="Term" value={TERM_LABEL[order.termWeeks as 1 | 4 | 12 | 24]} />
          <Row label="Weekly rate" value={`${money(order.weekly)}/week`} />
          <Row label="Deposit" value={money(order.deposit)} note="refundable" />
          <Row label="Charged today" value={money(order.dueToday)} strong />
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/${toQuery(state)}`}
            className="bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-surf"
          >
            Back to the plan
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* Left: what you designed */}
      <div>
        <p className="eyebrow">Review</p>
        <h1 className="display mt-2 text-4xl">Your setup</h1>

        <div className="mt-6 aspect-[3/2] w-full border border-rule bg-card">
          <StaticStage state={state} />
        </div>

        <ul className="mt-6 divide-y divide-rule border-y border-rule">
          {order_.map((slot) => {
            const item = placed.get(slot)!
            return (
              <li key={slot} className="flex items-center gap-3 py-2">
                <span className="shrink-0 border border-rule/60 bg-card">
                  <ItemThumb item={item} size={44} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{item.name}</span>
                  <span className="eyebrow">{SLOT_LABELS[slot]}</span>
                </span>
                <span className="num shrink-0 text-sm">
                  {money(item.priceWeekly)}
                  <span className="text-muted">/wk</span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Right: the money and the button */}
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="border border-rule bg-card p-5">
          <h2 className="eyebrow">Rental term</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TERMS.map((weeks) => (
              <Link
                key={weeks}
                href={`/checkout${toQuery({ ...state, termWeeks: weeks })}`}
                aria-current={state.termWeeks === weeks}
                className={`px-3 py-1.5 text-xs ${
                  state.termWeeks === weeks
                    ? 'bg-ink text-paper'
                    : 'border border-rule hover:bg-paper'
                }`}
              >
                {TERM_LABEL[weeks]}
              </Link>
            ))}
          </div>

          <dl className="mt-5 text-sm">
            <Row label="Items" value={String(q.itemCount)} />
            <Row label="List price" value={`${money(q.listWeekly)}/wk`} />
            {q.discountRate > 0 && (
              <Row
                label="Term discount"
                note={`${Math.round(q.discountRate * 100)}% off`}
                value={`−${money(q.savedWeekly)}/wk`}
                accent
              />
            )}
            <Row label="Your rate" value={`${money(q.weekly)}/wk`} strong />
            <Row
              label={`${TERM_LABEL[q.termWeeks]} of rental`}
              value={money(q.termTotal)}
            />
            <Row label="Deposit" value={money(q.deposit)} note="refundable" />
            <Row label="Due today" value={money(q.dueToday)} strong />
          </dl>

          <label className="mt-5 block">
            <span className="eyebrow">Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="mt-1.5 w-full border border-rule bg-paper px-3 py-2 text-sm placeholder:text-muted"
            />
          </label>

          <label className="mt-3 block">
            <span className="eyebrow">Phone *</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+62 8xx xxxx xxxx"
              className="mt-1.5 w-full border border-rule bg-paper px-3 py-2 text-sm placeholder:text-muted"
            />
          </label>

          <label className="mt-5 block">
            <span className="eyebrow">Deliver to</span>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mt-1.5 w-full border border-rule bg-paper px-3 py-2 text-sm"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block">
            <span className="eyebrow">Landmark or street (optional)</span>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="e.g. Jl. Pantai Berawa, near Deus Cafe"
              rows={2}
              className="mt-1.5 w-full resize-none border border-rule bg-paper px-3 py-2 text-sm placeholder:text-muted"
            />
          </label>
          <p className="mt-1.5 text-xs text-muted">Fields marked with * are required.</p>

          <p className="mt-3 text-xs text-muted">
            Free delivery, assembly and pickup. Arrives{' '}
            <span className="text-ink">{delivery}</span>.
          </p>

          {error && (
            <p role="alert" className="mt-3 border-l-2 border-teak pl-3 text-xs">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="mt-4 w-full bg-ink px-5 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-surf disabled:opacity-60"
          >
            {pending ? 'Booking…' : `Rent this setup — ${money(q.dueToday)} today`}
          </button>

          <Link
            href={`/${toQuery(state)}`}
            className="mt-3 block text-center text-xs text-muted underline decoration-rule underline-offset-2 hover:text-ink"
          >
            Keep editing
          </Link>
        </div>
      </aside>
    </div>
  )
}
