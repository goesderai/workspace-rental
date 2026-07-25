import Stage from '@/components/Stage'

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <p className="eyebrow">Geometry check</p>
        <h1 className="display mt-2 text-4xl">Plan your workspace</h1>
        <div className="mt-8 aspect-[3/2] w-full border border-rule bg-card">
          <Stage />
        </div>
      </div>
    </main>
  )
}
