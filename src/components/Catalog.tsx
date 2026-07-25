'use client'

import { useState } from 'react'
import { GROUPS, itemsIn, type Item } from '@/data/catalog'
import { money } from '@/lib/pricing'
import { canPlace, countOf } from '@/lib/state'
import { useWorkspace } from './WorkspaceProvider'
import { ItemThumb } from './ItemThumb'

function Card({ item }: { item: Item }) {
  const { state, dispatch, setArmed } = useWorkspace()
  const count = countOf(state, item.id)
  const allowed = canPlace(state, item)

  return (
    <button
      type="button"
      disabled={!allowed}
      onClick={() => dispatch({ type: 'place', itemId: item.id })}
      onMouseEnter={() => setArmed(item.category)}
      onMouseLeave={() => setArmed(null)}
      onFocus={() => setArmed(item.category)}
      onBlur={() => setArmed(null)}
      title={allowed ? undefined : 'Choose a desk first'}
      className="group relative flex w-full items-center gap-3 border border-rule bg-card p-2 text-left transition-colors hover:border-surf disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-rule"
    >
      <span className="shrink-0 border border-rule/60 bg-paper">
        <ItemThumb item={item} size={54} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium leading-tight">{item.name}</span>
        {item.note && (
          <span className="mt-0.5 block truncate text-xs text-muted">{item.note}</span>
        )}
        <span className="num mt-1 block text-xs">
          {money(item.priceWeekly)}
          <span className="text-muted">/week</span>
        </span>
      </span>

      {count > 0 && (
        <span className="num absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center bg-surf px-1 text-[11px] font-medium text-paper">
          {count}
        </span>
      )}
    </button>
  )
}

export default function Catalog() {
  const [open, setOpen] = useState<string>(GROUPS[0].category)

  return (
    <div className="divide-y divide-rule border border-rule">
      {GROUPS.map((group) => {
        const expanded = open === group.category
        const items = itemsIn(group.category)
        return (
          <section key={group.category}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(expanded ? '' : group.category)}
                aria-expanded={expanded}
                className="flex w-full items-baseline justify-between gap-2 px-3 py-2.5 text-left hover:bg-card"
              >
                <span className="text-sm font-semibold">{group.label}</span>
                <span className="num text-xs text-muted">
                  {expanded ? '−' : `${items.length}`}
                </span>
              </button>
            </h3>
            {expanded && (
              <div className="px-3 pb-3">
                <p className="mb-2 text-xs text-muted">{group.hint}</p>
                <div className="grid gap-2">
                  {items.map((item) => (
                    <Card key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
