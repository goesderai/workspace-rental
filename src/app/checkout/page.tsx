import type { Metadata } from 'next'
import Link from 'next/link'
import Checkout from '@/components/Checkout'
import { decodeState } from '@/lib/urlState'

export const metadata: Metadata = {
  title: 'Review your setup — monis.rent Bali',
}

/**
 * Reads the setup straight from the query, so this page needs no shared client
 * state and is itself a shareable link.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const state = decodeState({ s: one(sp.s), t: one(sp.t) })

  return (
    <>
      <header className="mx-auto w-full max-w-[1200px] px-4 pt-8 sm:px-6">
        <Link href="/" className="eyebrow hover:text-ink">
          ← monis.rent · Bali
        </Link>
      </header>
      <Checkout state={state} />
    </>
  )
}
