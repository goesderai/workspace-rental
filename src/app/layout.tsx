import type { Metadata } from 'next'
import { Archivo, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

/** Display: wide grotesque, used only for headings and the price. */
const archivo = Archivo({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
})

/** Body: everything a person reads as a sentence. */
const instrument = Instrument_Sans({
  variable: '--font-body',
  subsets: ['latin'],
})

/** Utility: prices, dimensions, and the architect's callouts. */
const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'Plan your workspace — monis.rent Bali',
  description:
    'Draw up a desk setup, pick how long you need it, and have it delivered anywhere in Bali.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
