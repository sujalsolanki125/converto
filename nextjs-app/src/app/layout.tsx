import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Converto - Professional Document Export Tool',
  description: 'Transform AI-generated content into professional documents with LaTeX support, syntax highlighting, and multi-format export',
  keywords: ['markdown', 'latex', 'pdf', 'docx', 'export', 'converter', 'katex', 'equations'],
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
