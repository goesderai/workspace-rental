'use client'

import { useState } from 'react'
import { SLOT_LABELS, SLOT_ORDER } from '@/lib/slots'
import { entriesOf, isEmpty } from '@/lib/state'
import { money } from '@/lib/pricing'
import { useWorkspace } from './WorkspaceProvider'

/**
 * The live spec list. It doubles as the keyboard-reachable way to remove
 * anything, since the stage artwork itself is pointer-driven.
 */
export default function Summary() {
  const { state, dispatch, setFocused } = useWorkspace()
  const [copied, setCopied] = useState(false)
  const placed = new Map(entriesOf(state))
  const order = SLOT_ORDER.filter((s) => placed.has(s))

  if (isEmpty(state)) return null

  /*
   * The whole setup lives in the URL, so sharing is just copying the address
   * bar. Read at click time rather than held in state — nothing to keep in sync.
   */
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (insecure context or denied permission). The address
      // bar already holds the link, so there is nothing to recover from.
    }
  }

  return (
    <div className="border border-rule">
      <div className="flex items-baseline justify-between border-b border-rule px-3 py-2">
        <h2 className="eyebrow">In this setup</h2>
        <div className="flex items-baseline gap-4">
          <button
            type="button"
            onClick={copyLink}
            className="text-xs text-muted underline decoration-rule underline-offset-2 hover:text-ink"
          >
            {copied ? 'Link copied' : 'Copy link to this setup'}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset' })}
            className="text-xs text-muted underline decoration-rule underline-offset-2 hover:text-ink"
          >
            Clear all
          </button>
        </div>
      </div>

      <ul className="divide-y divide-rule">
        {order.map((slot) => {
          const item = placed.get(slot)!
          return (
            <li
              key={slot}
              onMouseEnter={() => setFocused(slot)}
              onMouseLeave={() => setFocused((cur) => (cur === slot ? null : cur))}
              className="flex items-center gap-3 px-3 py-2 hover:bg-card"
            >
              <span className="eyebrow w-28 shrink-0">{SLOT_LABELS[slot]}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
              <span className="num shrink-0 text-sm">{money(item.priceWeekly)}</span>
              <button
                type="button"
                onClick={() => dispatch({ type: 'remove', slot })}
                aria-label={`Remove ${item.name}`}
                className="shrink-0 px-1 text-muted transition-colors hover:text-ink"
              >
                ×
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
