import { NextRequest, NextResponse } from 'next/server'
import { convertMarkdown } from '@/lib/markdown-converter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title = 'Document', theme = 'dark' } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Convert markdown to HTML
    const bodyHTML = convertMarkdown(content)

    // Theme colors
    const colors = theme === 'dark' ? {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      text: '#ffffff',
      heading: '#66e4ff',
    } : {
      background: '#ffffff',
      text: '#000000',
      heading: '#2563eb',
    }

    // Build complete HTML document
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      color: ${colors.text};
      background: ${colors.background};
    }
    h1 { color: ${colors.heading}; border-bottom: 2px solid ${colors.heading}; padding-bottom: 10px; }
    h2 { color: ${colors.heading}; margin-top: 30px; }
    h3 { color: ${colors.heading}; }
    code {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', monospace;
    }
    pre {
      background: #1e293b;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px;
      text-align: left;
    }
    th {
      background: rgba(102, 228, 255, 0.1);
      color: ${colors.heading};
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${bodyHTML}
</body>
</html>
    `

    // Return as downloadable file
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html;charset=utf-8',
        'Content-Disposition': `attachment; filename="${title.toLowerCase().replace(/\s+/g, '-')}.html"`,
      },
    })
  } catch (error) {
    console.error('HTML generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate HTML', details: String(error) },
      { status: 500 }
    )
  }
}
