import katex from 'katex'

/**
 * Convert LaTeX equations to OMML (Office Math Markup Language) for Word
 * This enables native, editable equations in Microsoft Word
 */
export function latexToOmml(latex: string, isDisplay: boolean = false): string {
  try {
    // First, render with KaTeX to get MathML
    const mathml = katex.renderToString(latex, {
      displayMode: isDisplay,
      output: 'mathml',
      throwOnError: false,
      trust: true,
      strict: false,
    })

    // Convert MathML to OMML (simplified version)
    // In production, use a proper MathML to OMML converter library
    const omml = mathmlToOmml(mathml)
    
    return omml
  } catch (error) {
    console.error('LaTeX to OMML conversion error:', error)
    // Fallback: return as text
    return latex
  }
}

/**
 * Convert MathML to OMML format
 * This is a simplified converter - for production use a full library
 */
function mathmlToOmml(mathml: string): string {
  // Remove namespace prefixes and clean up
  let omml = mathml
    .replace(/<math[^>]*>/g, '<m:oMath>')
    .replace(/<\/math>/g, '</m:oMath>')
    .replace(/<mrow>/g, '<m:r>')
    .replace(/<\/mrow>/g, '</m:r>')
    .replace(/<mi>/g, '<m:t>')
    .replace(/<\/mi>/g, '</m:t>')
    .replace(/<mo>/g, '<m:t>')
    .replace(/<\/mo>/g, '</m:t>')
    .replace(/<mn>/g, '<m:t>')
    .replace(/<\/mn>/g, '</m:t>')
    .replace(/<msup>/g, '<m:sSup><m:e>')
    .replace(/<\/msup>/g, '</m:e></m:sSup>')
    .replace(/<msub>/g, '<m:sSub><m:e>')
    .replace(/<\/msub>/g, '</m:e></m:sSub>')
    .replace(/<mfrac>/g, '<m:f><m:num>')
    .replace(/<\/mfrac>/g, '</m:den></m:f>')
    .replace(/<msubsup>/g, '<m:sSubSup><m:e>')
    .replace(/<\/msubsup>/g, '</m:e></m:sSubSup>')
    .replace(/<msqrt>/g, '<m:rad>')
    .replace(/<\/msqrt>/g, '</m:rad>')
    .replace(/<mroot>/g, '<m:rad><m:deg>')
    .replace(/<\/mroot>/g, '</m:deg></m:rad>')
    .replace(/<munder>/g, '<m:limLow><m:e>')
    .replace(/<\/munder>/g, '</m:e></m:limLow>')
    .replace(/<mover>/g, '<m:limUpp><m:e>')
    .replace(/<\/mover>/g, '</m:e></m:limUpp>')
    .replace(/<munderover>/g, '<m:limLow><m:limUpp><m:e>')
    .replace(/<\/munderover>/g, '</m:e></m:limUpp></m:limLow>')

  return omml
}

/**
 * Extract all LaTeX equations from markdown
 */
export function extractLatexEquations(markdown: string): {
  display: { latex: string; placeholder: string }[]
  inline: { latex: string; placeholder: string }[]
} {
  const display: { latex: string; placeholder: string }[] = []
  const inline: { latex: string; placeholder: string }[] = []

  // Extract display equations ($$...$$)
  const displayRegex = /\$\$([\s\S]*?)\$\$/g
  let match
  let index = 0
  
  while ((match = displayRegex.exec(markdown)) !== null) {
    const placeholder = `{{DISPLAY_MATH_${index}}}`
    display.push({ latex: match[1].trim(), placeholder })
    index++
  }

  // Extract inline equations ($...$)
  const inlineRegex = /\$([^\$\n]+?)\$/g
  index = 0
  
  while ((match = inlineRegex.exec(markdown)) !== null) {
    const placeholder = `{{INLINE_MATH_${index}}}`
    inline.push({ latex: match[1].trim(), placeholder })
    index++
  }

  return { display, inline }
}

/**
 * Replace LaTeX equations with OMML in content
 */
export function replaceLatexWithOmml(content: string, equations: {
  display: { latex: string; placeholder: string }[]
  inline: { latex: string; placeholder: string }[]
}): string {
  let result = content

  // Replace display equations
  equations.display.forEach(({ latex, placeholder }) => {
    const omml = latexToOmml(latex, true)
    result = result.replace(placeholder, omml)
  })

  // Replace inline equations
  equations.inline.forEach(({ latex, placeholder }) => {
    const omml = latexToOmml(latex, false)
    result = result.replace(placeholder, omml)
  })

  return result
}
