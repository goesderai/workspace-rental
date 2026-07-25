/**
 * Internal reference sheet. Every asset drawn at the same scale on the same
 * grid, so drift in angle, stroke weight or light direction is obvious.
 */

import { project } from '@/lib/iso'
import { PALETTE } from '@/lib/palette'
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

const ITEMS: [string, React.ReactNode][] = [
  ['DeskMechanical', <DeskMechanical key="a" />],
  ['DeskElectrical', <DeskElectrical key="b" />],
  ['ChairErgonomic', <ChairErgonomic key="c" />],
  ['ChairTeak', <ChairTeak key="d" />],
  ['Monitor24', <Monitor24 key="e" />],
  ['Monitor27', <Monitor27 key="f" />],
  ['MonitorUltrawide', <MonitorUltrawide key="g" />],
  ['StudioDisplay', <StudioDisplay key="h" />],
  ['DeskLamp', <DeskLamp key="i" />],
  ['PlantMonstera', <PlantMonstera key="j" />],
  ['PlantDesk', <PlantDesk key="k" />],
  ['Keyboard', <Keyboard key="l" />],
  ['LaptopStand', <LaptopStand key="m" />],
  ['Mug', <Mug key="n" />],
  ['RugJute', <RugJute key="o" />],
  ['Surfboard', <Surfboard key="p" />],
  ['Scooter', <Scooter key="q" />],
  ['CoffeeMachine', <CoffeeMachine key="r" />],
  ['BeanBag', <BeanBag key="s" />],
  ['Fan', <Fan key="t" />],
]

/** A 20cm reference grid under each asset, so scale is comparable at a glance. */
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  const lines = []
  for (let i = -100; i <= 100; i += 20) {
    const a = project(i, -100)
    const b = project(i, 100)
    const c = project(-100, i)
    const d = project(100, i)
    lines.push(
      <line key={`x${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />,
      <line key={`y${i}`} x1={c.x} y1={c.y} x2={d.x} y2={d.y} />,
    )
  }
  return (
    <figure className="border border-rule bg-card p-2">
      <svg viewBox="-190 -190 380 320" className="w-full">
        <g stroke={PALETTE.grid} strokeWidth={0.7}>
          {lines}
        </g>
        {children}
      </svg>
      <figcaption className="eyebrow mt-1">{label}</figcaption>
    </figure>
  )
}

export default function ArtSheet() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="eyebrow">Reference sheet</p>
      <h1 className="display mt-2 text-3xl">Assets</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {ITEMS.map(([label, node]) => (
          <Cell key={label} label={label}>
            {node}
          </Cell>
        ))}
      </div>
    </main>
  )
}
