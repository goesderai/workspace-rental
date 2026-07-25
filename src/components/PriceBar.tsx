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
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-8 sm:gap-y-4 sm:px-6">
        {/* Term */}
        <div className="min-w-0">
          <p className="eyebrow mb-1.5">Rental term</p>
          <div
            className="flex w-fit max-w-full divide-x divide-rule overflow-x-auto border border-rule"
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
                  className={`relative shrink-0 whitespace-nowrap px-3 py-1.5 text-xs transition-colors ${
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
        <div className="flex items-end justify-between gap-6 sm:justify-start">
          <div>
            <p className="eyebrow mb-1">Your rate</p>
            {/*
             * The ticker counts through intermediate values, which would make a
             * live region chatter, so it is hidden from assistive tech and the
             * settled figure is announced once instead.
             */}
            <p className="display num text-3xl leading-none" aria-hidden>
              <Ticker value={q.weekly} />
              <span className="ml-1 text-base font-normal text-muted">/week</span>
            </p>
            <p className="sr-only" aria-live="polite">
              {`${money(q.weekly)} per week for ${q.itemCount} ${
                q.itemCount === 1 ? 'item' : 'items'
              }, ${money(q.deposit)} refundable deposit.`}
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

        <div className="flex items-center gap-4 sm:ml-auto">
          <p className="hidden text-xs text-muted sm:block">
            Free delivery and setup
            <br />
            <span className="text-ink">Arrives {delivery} in Bali</span>
          </p>
          <motion.div className="flex-1 sm:flex-none" whileHover={empty ? undefined : { y: -1 }}>
            <Link
              href={empty ? '#' : `/checkout${toQuery(state)}`}
              aria-disabled={empty}
              tabIndex={empty ? -1 : undefined}
              onClick={(e) => empty && e.preventDefault()}
              className={`inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-colors sm:w-auto ${
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
