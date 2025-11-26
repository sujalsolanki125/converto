import { marked } from 'marked'
import katex from 'katex'

/**
 * Convert Markdown to HTML with LaTeX support
 * Uses the same approach as the original working HTML app
 */
export function convertMarkdown(markdown: string): string {
  if (!markdown) return ''

  try {
    // Pre-process math equations (extract and replace with placeholders)
    const { content: processedMarkdown, displayMaths, inlineMaths } = preprocessMath(markdown)

    // Configure marked (no custom renderer - CSS will style headers)
    marked.setOptions({
      breaks: true,
      gfm: true
    })

    // Convert markdown to HTML
    let html = marked.parse(processedMarkdown) as string

    // Post-process: render math equations with KaTeX
    html = postprocessMath(html, displayMaths, inlineMaths)

    return html
  } catch (error) {
    console.error('Markdown conversion error:', error)
    return `<p class="error">Error converting markdown: ${error}</p>`
  }
}

/**
 * Pre-process LaTeX math equations
 * Extract math and replace with placeholders to protect from markdown parser
 */
function preprocessMath(markdown: string) {
  const displayMaths: string[] = []
  const inlineMaths: string[] = []

  // Convert LaTeX-style \[...\] to $$...$$
  markdown = markdown.replace(/\\\[([\s\S]*?)\\\]/g, (_, equation) => `$$${equation}$$`)

  // Convert LaTeX-style \(...\) to $...$
  markdown = markdown.replace(/\\\((.*?)\\\)/g, (_, equation) => `$${equation}$`)

  // Convert ChatGPT-style ( \command... ) to $...$
  markdown = markdown.replace(/\(\s+(\\[a-zA-Z]+[^)]*?)\s+\)/g, (_, equation) => `$${equation.trim()}$`)

  // Process display math ($$...$$) - handle multi-line
  markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (_, equation) => {
    displayMaths.push(equation.trim())
    return `\n%%%DISPLAY_MATH_${displayMaths.length - 1}%%%\n`
  })

  // Process inline math ($...$) - avoid matching across lines
  markdown = markdown.replace(/\$([^\$\n]+?)\$/g, (_, equation) => {
    inlineMaths.push(equation.trim())
    return `%%%INLINE_MATH_${inlineMaths.length - 1}%%%`
  })

  return { content: markdown, displayMaths, inlineMaths }
}

/**
 * Post-process HTML to render math with KaTeX
 * Replace placeholders with rendered KaTeX HTML
 */
function postprocessMath(html: string, displayMaths: string[], inlineMaths: string[]): string {
  // Render display math
  displayMaths.forEach((equation, index) => {
    const placeholder = `%%%DISPLAY_MATH_${index}%%%`
    const patterns = [`<p>${placeholder}</p>`, placeholder]

    try {
      // Render with output: 'html' but store original LaTeX in data attribute for DOCX export
      const rendered = katex.renderToString(equation, {
        displayMode: true,
        throwOnError: false,
        trust: true,
        strict: false,
      })
      
      // Wrap with data attribute containing original LaTeX for easy extraction
      const wrappedRendered = `<div class="katex-display-wrapper my-4" data-latex="${escapeHtml(equation)}">${rendered}</div>`

      patterns.forEach(pattern => {
        html = html.split(pattern).join(wrappedRendered)
      })
    } catch (e: any) {
      console.error('Display math error:', e.message)
      const errorMsg = `<div class="math-error text-red-500">LaTeX Error: ${e.message}</div>`
      patterns.forEach(pattern => {
        html = html.split(pattern).join(errorMsg)
      })
    }
  })

  // Render inline math
  inlineMaths.forEach((equation, index) => {
    const placeholder = `%%%INLINE_MATH_${index}%%%`

    try {
      // Render with output: 'html' but store original LaTeX in data attribute for DOCX export
      const rendered = katex.renderToString(equation, {
        displayMode: false,
        throwOnError: false,
        trust: true,
        strict: false,
      })
      
      // Wrap with data attribute containing original LaTeX for easy extraction
      const wrappedRendered = `<span class="katex-inline" data-latex="${escapeHtml(equation)}">${rendered}</span>`
      
      html = html.split(placeholder).join(wrappedRendered)
    } catch (e: any) {
      console.error('Inline math error:', e.message)
      html = html.split(placeholder).join(`<span class="math-error text-red-500">$${equation}$</span>`)
    }
  })

  return html
}

/**
 * Escape HTML for attribute values
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Get statistics from markdown
 */
export function getMarkdownStats(markdown: string) {
  const plainText = markdown.replace(/[#*`_~\[\]()]/g, '')
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
  const chars = markdown.length
  const lines = markdown.split('\n').length

  return { words, chars, lines }
}
