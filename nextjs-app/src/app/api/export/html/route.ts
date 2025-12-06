import { NextRequest, NextResponse } from 'next/server'
import { convertMarkdown } from '@/lib/markdown-converter'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { content, title = 'Document', options = {} } = body
    const theme = options.theme || 'color'
    const isPreEditedHTML = options.isPreEditedHTML || false

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Valid content is required' },
        { status: 400 }
      )
    }

    // Validate content length (prevent abuse)
    if (content.length > 1000000) { // 1MB limit
      return NextResponse.json(
        { error: 'Content too large. Maximum 1MB allowed.' },
        { status: 413 }
      )
    }

    console.log(`[HTML Export] Generating HTML for document: "${title}" (${content.length} chars, Pre-edited: ${isPreEditedHTML})`)

    // Convert markdown to HTML or use pre-edited HTML
    const bodyHTML = isPreEditedHTML ? content : convertMarkdown(content)

    // Theme colors - matching original export-handler.js
    const colors = theme === 'color' ? {
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      text: '#e2e8f0',
      heading: '#66e4ff',
      code: '#1e293b',
      border: 'rgba(102, 228, 255, 0.2)'
    } : {
      background: '#ffffff',
      text: '#000000',
      heading: '#000000',
      code: '#f5f5f5',
      border: '#cccccc'
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
      background: ${colors.code};
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Consolas', monospace;
      color: ${theme === 'color' ? '#e2e8f0' : '#000000'};
    }
    pre {
      background: ${colors.code};
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
    }
    pre code {
      background: transparent;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid ${colors.border};
      padding: 12px;
      text-align: left;
    }
    th {
      background: ${theme === 'color' ? 'rgba(102, 228, 255, 0.1)' : '#f0f0f0'};
      color: ${colors.heading};
      font-weight: 600;
    }
    .katex { color: ${colors.text}; }
    .highlight-yellow { background: rgba(251, 191, 36, 0.25); padding: 2px 4px; border-radius: 3px; }
    .highlight-cyan { background: rgba(102, 228, 255, 0.25); padding: 2px 4px; border-radius: 3px; }
    .highlight-magenta { background: rgba(217, 70, 239, 0.25); padding: 2px 4px; border-radius: 3px; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Render KaTeX
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ]
      });
      // Highlight code
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    });
  </script>
</head>
<body>
  <h1>${title}</h1>
  ${bodyHTML}
</body>
</html>
    `

    console.log(`[HTML Export] Successfully generated HTML (${html.length} bytes)`)

    // Return as downloadable file
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html;charset=utf-8',
        'Content-Disposition': `attachment; filename="${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[HTML Export] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate HTML', 
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
