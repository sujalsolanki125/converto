import puppeteer from 'puppeteer'
import { convertMarkdown } from './markdown-converter'

interface PdfOptions {
  content: string
  title?: string
  author?: string
  date?: string
  theme?: 'light' | 'dark'
}

/**
 * Generate high-quality PDF using Puppeteer
 */
export async function generatePdf(options: PdfOptions): Promise<Buffer> {
  const { content, title = 'Document', author = '', date = new Date().toLocaleDateString(), theme = 'dark' } = options

  // Convert markdown to HTML
  const bodyHTML = convertMarkdown(content)

  // Theme colors
  const colors = theme === 'dark' ? {
    background: '#0f172a',
    text: '#ffffff',
    heading: '#66e4ff',
    accent: '#d946ef',
    code: '#1e293b',
    codeText: '#e2e8f0',
    tableBg: 'rgba(255, 255, 255, 0.02)',
    tableHeader: 'rgba(102, 228, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
  } : {
    background: '#ffffff',
    text: '#000000',
    heading: '#2563eb',
    accent: '#7c3aed',
    code: '#f5f5f5',
    codeText: '#000000',
    tableBg: '#ffffff',
    tableHeader: '#2563eb',
    border: '#e2e8f0',
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
      background: ${colors.background};
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
      color: ${theme === 'dark' ? colors.heading : '#ffffff'};
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
      background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc'};
    }
    
    blockquote {
      border-left: 4px solid ${colors.accent};
      padding-left: 15px;
      margin: 10px 0;
      color: ${colors.text};
      opacity: 0.8;
      font-style: italic;
      background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f9f9f9'};
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
</body>
</html>
  `

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
