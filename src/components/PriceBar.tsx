'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { TERMS, isEmpty } from '@/lib/state'
import {
  TERM_DISCOUNT,
  TERM_LABEL,
  deliveryDate,
  formatDeliveryDate,
  money,
  quote,
} from '@/lib/pricing'
import { toQuery } from '@/lib/urlState'
import { useWorkspace } from './WorkspaceProvider'

/** Counts to a new value rather than snapping, so the price feels like it moves. */
function Ticker({ value }: { value: number }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  /** Live displayed value, so an interrupted run resumes from where it stopped. */
  const current = useRef(value)

  useEffect(() => {
    const origin = current.current
    const delta = value - origin
    if (reduced || delta === 0) {
      current.current = value
      setShown(value)
      return
    }

    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 260)
      // Ease out so the last few cents settle instead of stopping dead.
      const v = origin + delta * (1 - (1 - t) ** 3)
      current.current = v
      setShown(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, reduced])

  return <>{money(Math.round(shown * 100) / 100)}</>
}

export default function PriceBar() {
  const { state, dispatch } = useWorkspace()
  const q = quote(state)
  const empty = isEmpty(state)
  const delivery = formatDeliveryDate(deliveryDate())

  return (
    <div className="border-t border-rule bg-card/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-end gap-x-8 gap-y-4 px-4 py-3 sm:px-6">
        {/* Term */}
        <div>
          <p className="eyebrow mb-1.5">Rental term</p>
          <div
            className="flex divide-x divide-rule border border-rule"
            role="group"
            aria-label="Rental term"
          >
            {TERMS.map((weeks) => {
              const on = state.termWeeks === weeks
              return (
                <button
                  key={weeks}
                  type="button"
                  aria-pressed={on}
                  onClick={() => dispatch({ type: 'setTerm', termWeeks: weeks })}
                  className={`relative px-3 py-1.5 text-xs transition-colors ${
                    on ? 'bg-ink text-paper' : 'hover:bg-paper'
                  }`}
                >
                  {TERM_LABEL[weeks]}
                  {TERM_DISCOUNT[weeks] > 0 && (
                    <span className={`num ml-1.5 ${on ? 'text-sun' : 'text-surf'}`}>
                      −{Math.round(TERM_DISCOUNT[weeks] * 100)}%
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Running total */}
        <div className="flex items-end gap-6">
          <div>
            <p className="eyebrow mb-1">Your rate</p>
            <p className="display num text-3xl leading-none">
              <Ticker value={q.weekly} />
              <span className="ml-1 text-base font-normal text-muted">/week</span>
            </p>
          </div>
          <dl className="hidden text-xs sm:block">
            <div className="flex gap-2">
              <dt className="text-muted">Items</dt>
              <dd className="num">{q.itemCount}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted">Deposit</dt>
              <dd className="num">{money(q.deposit)}</dd>
            </div>
            {q.savedWeekly > 0 && (
              <div className="flex gap-2">
                <dt className="text-muted">You save</dt>
                <dd className="num text-surf">{money(q.savedWeekly)}/wk</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <p className="hidden text-xs text-muted sm:block">
            Free delivery and setup
            <br />
            <span className="text-ink">Arrives {delivery} in Bali</span>
          </p>
          <motion.div whileHover={empty ? undefined : { y: -1 }}>
            <Link
              href={empty ? '#' : `/checkout${toQuery(state)}`}
              aria-disabled={empty}
              tabIndex={empty ? -1 : undefined}
              onClick={(e) => empty && e.preventDefault()}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors ${
                empty
                  ? 'cursor-not-allowed bg-rule text-muted'
                  : 'bg-ink text-paper hover:bg-surf'
              }`}
            >
              {empty ? 'Add a desk to start' : 'Review setup'}
              {!empty && <span aria-hidden>→</span>}
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
