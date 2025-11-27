import path from 'path'

import { convertMarkdown } from './markdown-converter'

interface PdfOptions {
  content: string
  title?: string
  author?: string
  date?: string
  theme?: 'color' | 'bw'
}

/**
 * Generate high-quality PDF using Puppeteer
 * Uses serverless-optimized Chrome on Vercel, standard Puppeteer locally
 */
export async function generatePdf(options: PdfOptions): Promise<Buffer> {
  const { content, title = 'Document', author = '', date = new Date().toLocaleDateString(), theme = 'color' } = options

  // Convert markdown to HTML
  const bodyHTML = convertMarkdown(content)

  // Theme colors matching original export-handler.js
  const colors = theme === 'color' ? {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    text: '#e2e8f0',
    heading: '#66e4ff',
    accent: '#d946ef',
    code: 'rgba(255, 255, 255, 0.05)',
    codeText: '#e2e8f0',
    tableBg: 'rgba(255, 255, 255, 0.02)',
    tableHeader: 'rgba(102, 228, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
  } : {
    background: '#ffffff',
    text: '#000000',
    heading: '#1a1a1a',
    accent: '#1a1a1a',
    code: '#f5f5f5',
    codeText: '#000000',
    tableBg: '#ffffff',
    tableHeader: '#f0f0f0',
    border: '#cccccc',
  }

  // Build complete HTML document
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: ${colors.text};
      background: ${theme === 'color' ? '#0f172a' : colors.background};
      padding: 40px;
    }
    
    .document-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${colors.heading};
    }
    
    .document-title {
      font-size: 24pt;
      font-weight: bold;
      color: ${colors.heading};
      margin-bottom: 10px;
    }
    
    .document-author {
      font-size: 11pt;
      color: ${colors.accent};
      margin-bottom: 5px;
    }
    
    .document-date {
      font-size: 10pt;
      color: ${colors.text};
      opacity: 0.6;
    }
    
    h1 {
      font-size: 20pt;
      color: ${colors.heading};
      margin-top: 20px;
      margin-bottom: 12px;
      border-bottom: 1px solid ${colors.border};
      padding-bottom: 5px;
    }
    
    h2 {
      font-size: 16pt;
      color: ${colors.accent};
      margin-top: 15px;
      margin-bottom: 8px;
    }
    
    h3 {
      font-size: 14pt;
      color: ${colors.heading};
      margin-top: 12px;
      margin-bottom: 6px;
    }
    
    p {
      margin: 10px 0;
    }
    
    code {
      font-family: 'Consolas', 'Courier New', monospace;
      background-color: ${colors.code};
      color: ${colors.codeText};
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10pt;
    }
    
    pre {
      font-family: 'Consolas', 'Courier New', monospace;
      background-color: ${colors.code};
      color: ${colors.codeText};
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
      overflow-x: auto;
      border: 1px solid ${colors.border};
    }
    
    pre code {
      background: transparent;
      padding: 0;
      border: none;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      border: 1px solid ${colors.border};
      background: ${colors.tableBg};
    }
    
    th {
      background: ${colors.tableHeader};
      color: ${theme === 'color' ? colors.heading : colors.text};
      padding: 8px;
      border: 1px solid ${colors.border};
      text-align: left;
      font-weight: bold;
    }
    
    td {
      padding: 8px;
      border: 1px solid ${colors.border};
      color: ${colors.text};
    }
    
    tr:nth-child(even) {
      background: ${theme === 'color' ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'};
    }
    
    blockquote {
      border-left: 4px solid ${colors.accent};
      padding-left: 15px;
      margin: 10px 0;
      color: ${colors.text};
      opacity: 0.8;
      font-style: italic;
      background: ${theme === 'color' ? 'rgba(255, 255, 255, 0.02)' : '#f9f9f9'};
      padding: 10px;
      border-radius: 0 4px 4px 0;
    }
    
    ul, ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    li {
      margin: 5px 0;
    }
    
    a {
      color: ${colors.heading};
      text-decoration: none;
    }
    
    .katex-display {
      margin: 20px 0;
      text-align: center;
    }
    
    /* KaTeX color support for B&W theme */
    ${theme === 'bw' ? `
    .katex * {
      color: #000000 !important;
      border-color: #000000 !important;
    }
    ` : ''}
    
    /* Highlight colors */
    .highlight-yellow {
      background-color: ${theme === 'color' ? 'rgba(255, 255, 0, 0.3)' : '#ffff99'};
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    .highlight-cyan {
      background-color: ${theme === 'color' ? 'rgba(0, 255, 255, 0.3)' : '#ccffff'};
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    .highlight-magenta {
      background-color: ${theme === 'color' ? 'rgba(255, 0, 255, 0.3)' : '#ffccff'};
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    .document-footer {
      margin-top: 40px;
      padding-top: 10px;
      border-top: 1px solid ${colors.border};
      text-align: center;
      font-size: 9pt;
      color: ${colors.text};
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div class="document-header">
    <div class="document-title">${title}</div>
    ${author ? `<div class="document-author">By ${author}</div>` : ''}
    <div class="document-date">${date}</div>
  </div>
  
  <div class="document-content">
    ${bodyHTML}
  </div>
  
  <div class="document-footer">
    Generated by Converto on ${date}
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
        throwOnError: false
      });
    });
  </script>
</body>
</html>
  `

  // Detect environment - use multiple checks for reliability
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
  
  console.log('[PDF Generator] Environment:', {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    isVercel,
    nodeEnv: process.env.NODE_ENV
  })
  
  let browser
  if (isVercel) {
    // Production: Use serverless-optimized Chrome with LOW MEMORY MODE
    console.log('[PDF Generator] Using serverless Chrome with LOW MEMORY MODE for Hobby plan')
    const chromium = await import('@sparticuz/chromium')
    const puppeteerCore = await import('puppeteer-core')
    
    try {
      // CRITICAL: Enable low-memory mode for Hobby plan (1024MB limit)
      chromium.default.setGraphicsMode = false
      chromium.default.setHeadlessMode = 'shell'
      
      // Get executable path
      const chromiumPackagePath = path.join(process.cwd(), 'node_modules', '@sparticuz', 'chromium')
      const executablePath = await chromium.default.executablePath()

      // Ensure Chromium shared libraries can be located by the loader
      const chromiumDir = path.dirname(executablePath)
      const libraryPathCandidates = [
        chromiumDir,
        path.join(chromiumPackagePath, 'bin'),
        '/tmp',
        '/tmp/chromium',
        '/tmp/swiftshader',
        '/tmp/al2',
        '/tmp/al2023',
      ]
      const currentLibraryPath = process.env.LD_LIBRARY_PATH ? process.env.LD_LIBRARY_PATH.split(':') : []
      const mergedLibraryPaths = [...libraryPathCandidates, ...currentLibraryPath.filter(Boolean)]
      process.env.LD_LIBRARY_PATH = mergedLibraryPaths.join(':')
      
      console.log('[PDF Generator] LOW MEMORY configuration:')
      console.log('  - Graphics Enabled:', chromium.default.graphics)
      console.log('  - Executable:', executablePath)
      console.log('  - LD_LIBRARY_PATH:', process.env.LD_LIBRARY_PATH)
      console.log('  - Memory optimization: ENABLED')
      
      browser = await puppeteerCore.default.launch({
        args: [
          ...chromium.default.args,
          // Additional low-memory flags for Hobby plan
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--disable-accelerated-2d-canvas',
          '--disable-background-networking',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-extensions',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          '--force-color-profile=srgb',
          '--hide-scrollbars',
          '--metrics-recording-only',
          '--mute-audio',
        ],
        defaultViewport: chromium.default.defaultViewport,
        executablePath,
        headless: chromium.default.headless,
        ignoreHTTPSErrors: true,
      })
      
      console.log('[PDF Generator] Chrome launched successfully in LOW MEMORY MODE')
    } catch (error) {
      console.error('[PDF Generator] Chrome launch failed:', error)
      console.error('[PDF Generator] Error details:', error instanceof Error ? error.message : 'Unknown')
      throw new Error(`Failed to launch browser in low-memory mode: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    // Local development: Use standard Puppeteer
    console.log('[PDF Generator] Using local Puppeteer')
    const puppeteer = await import('puppeteer')
    
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    })
  }

  let page
  try {
    page = await browser.newPage()
    
    // Set timeout for production environments
    await page.setDefaultNavigationTimeout(30000)
    await page.setDefaultTimeout(30000)
    
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF with production-ready settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      preferCSSPageSize: false,
    })

    return Buffer.from(pdfBuffer)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    if (page) await page.close().catch(console.error)
    await browser.close().catch(console.error)
  }
}
