import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Converto - Professional Document Converter',
  description: 'Transform AI-generated content into professional documents. Export to PDF, DOCX, and HTML with perfect formatting, LaTeX equations, code highlighting, and more.',
  keywords: ['markdown', 'latex', 'pdf', 'docx', 'export', 'converter', 'katex', 'equations', 'AI content', 'document converter'],
  authors: [{ name: 'Converto Team' }],
  creator: 'Converto',
  publisher: 'Converto',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Converto - Professional Document Converter',
    description: 'Transform AI-generated content into professional documents with perfect formatting',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Converto - Professional Document Converter',
    description: 'Transform AI-generated content into professional documents',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" defer />
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" defer />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" defer />
        <script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js" defer />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
