import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediRAG — Evidence-grounded clinical decision support',
  description: 'A biomedical retrieval-augmented generation foundation for transparent clinical decision support.',
  generator: 'MediRAG',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F7F5F1',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
