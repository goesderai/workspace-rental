import { isoTranslate } from '@/lib/iso'
import { anchorsFor, SLOT_ORDER } from '@/lib/slots'
import { deskItem, entriesOf, type WorkspaceState } from '@/lib/state'
import { Floor, PlanGrid, stageViewBox } from './scene'

/** The plan, drawn without interaction — for checkout and any future share image. */
export default function StaticStage({ state }: { state: WorkspaceState }) {
  const anchors = anchorsFor(deskItem(state)?.size ?? null)
  const placed = new Map(entriesOf(state))

  return (
    <svg
      viewBox={stageViewBox()}
      className="h-full w-full"
      role="img"
      aria-label="Isometric plan of the workspace you designed"
    >
      <Floor />
      <PlanGrid />
      {SLOT_ORDER.filter((s) => placed.has(s)).map((slot) => {
        const item = placed.get(slot)!
        const at = anchors[slot]
        return (
          <g key={slot} transform={isoTranslate(at.x, at.y, at.z)}>
            <item.Art />
          </g>
        )
      })}
    </svg>
  )
}
