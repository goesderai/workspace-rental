import Builder from '@/components/Builder'
import { WorkspaceProvider } from '@/components/WorkspaceProvider'

/**
 * `searchParams` is read on the server and handed to the provider as the
 * initial state, so a shared link renders its setup on the first paint instead
 * of flashing an empty plan.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

  return (
    <WorkspaceProvider initial={{ s: one(sp.s), t: one(sp.t) }}>
      <header className="mx-auto w-full max-w-[1400px] px-4 pb-5 pt-8 sm:px-6">
        <p className="eyebrow">monis.rent · Bali · delivered and set up</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h1 className="display text-4xl sm:text-5xl">Plan your workspace</h1>
          <p className="max-w-sm text-sm text-muted">
            Draw up the desk setup you want, choose how long you need it, and we bring it to
            your villa. Rent it by the week — no buying, no shipping it home.
          </p>
        </div>
      </header>
      <Builder />
    </WorkspaceProvider>
  )
}
