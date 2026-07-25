'use client'

import { isEmpty } from '@/lib/state'
import DragLayer from './DragLayer'
import Catalog from './Catalog'
import PriceBar from './PriceBar'
import Stage from './Stage'
import Summary from './Summary'
import { useWorkspace } from './WorkspaceProvider'

/** Shown over the empty plan, in the interface's voice: an invitation to act. */
function EmptyHint() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <p className="max-w-xs text-center text-sm text-muted">
        Pick a desk to start. Everything else drops onto it.
      </p>
    </div>
  )
}

export default function Builder() {
  const { state } = useWorkspace()

  return (
    <DragLayer>
      <div className="flex flex-1 flex-col">
        <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-6 px-4 pb-6 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          {/* Catalog rail */}
          <div className="order-2 lg:order-1">
            <h2 className="eyebrow mb-2">
              Catalog
              <span className="hidden sm:inline">
                {' '}
                — click to add, or drag onto the plan. Click a placed item, or drag it off, to
                remove.
              </span>
            </h2>
            <Catalog />
          </div>

          {/* Stage */}
          <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2">
            {/* Taller on a phone, where the plan gets much less width. */}
            <div className="relative aspect-[4/3] w-full border border-rule bg-card sm:aspect-[3/2]">
              <Stage />
              {isEmpty(state) && <EmptyHint />}
            </div>
            <Summary />
          </div>
        </div>

        <div className="sticky bottom-0 z-10">
          <PriceBar />
        </div>
      </div>
    </DragLayer>
  )
}
