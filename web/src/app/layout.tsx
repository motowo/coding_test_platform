import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | SkillGaug',
    default: 'SkillGaug - Coding Assessment Platform',
  },
  description: 'Modern coding assessment platform for technical hiring and skill evaluation.',
  keywords: ['coding', 'assessment', 'hiring', 'programming', 'evaluation', 'skills'],
  authors: [{ name: 'SkillGaug Team' }],
  creator: 'SkillGaug Team',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    title: 'SkillGaug - Coding Assessment Platform',
    description: 'Modern coding assessment platform for technical hiring and skill evaluation.',
    siteName: 'SkillGaug',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillGaug - Coding Assessment Platform',
    description: 'Modern coding assessment platform for technical hiring and skill evaluation.',
    creator: '@skillgaug',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification tokens here when available
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}