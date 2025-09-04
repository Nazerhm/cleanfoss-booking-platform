import React from 'react'
import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'CleanFoss - Professionel Bilrengøring',
  description: 'Book din bilrengøring online med Danmarks mest pålidelige leverandører',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="da">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}