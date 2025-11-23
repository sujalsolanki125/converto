import { Document, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { marked } from 'marked'
import { latexToOmml, extractLatexEquations } from './latex-converter'

interface DocxOptions {
  content: string
  title?: string
  author?: string
  date?: string
  theme?: 'light' | 'dark'
}

/**
 * Generate native DOCX file with OMML equations
 */
export async function generateDocx(options: DocxOptions): Promise<Buffer> {
  const { content, title = 'Document', author = '', date = new Date().toLocaleDateString(), theme = 'dark' } = options

  // Extract LaTeX equations first
  const equations = extractLatexEquations(content)
  
  // Replace equations with placeholders
  let processedContent = content
  equations.display.forEach(({ latex }, index) => {
    processedContent = processedContent.replace(`$$${latex}$$`, `{{DISPLAY_MATH_${index}}}`)
  })
  equations.inline.forEach(({ latex }, index) => {
    processedContent = processedContent.replace(`$${latex}$`, `{{INLINE_MATH_${index}}}`)
  })

  // Parse markdown to tokens
  const tokens = marked.lexer(processedContent)

  // Theme colors
  const colors = theme === 'dark' ? {
    background: '0F172A',
    text: 'FFFFFF',
    heading: '66E4FF',
    accent: 'D946EF',
    code: '1E293B',
    codeText: 'E2E8F0',
  } : {
    background: 'FFFFFF',
    text: '000000',
    heading: '2563EB',
    accent: '7C3AED',
    code: 'F5F5F5',
    codeText: '000000',
  }

  // Create document sections
  const sections: Paragraph[] = []

  // Add title
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  )

  // Add author if provided
  if (author) {
    sections.push(
      new Paragraph({
        text: `By ${author}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    )
  }

  // Add date
  sections.push(
    new Paragraph({
      text: date,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // Process tokens
  for (const token of tokens) {
    switch (token.type) {
      case 'heading':
        sections.push(
          new Paragraph({
            text: token.text,
            heading: getHeadingLevel(token.depth),
            spacing: { before: 240, after: 120 },
          })
        )
        break

      case 'paragraph':
        const paragraph = new Paragraph({
          spacing: { before: 120, after: 120 },
        })
        
        // Check for math placeholders
        if (token.text.includes('{{DISPLAY_MATH_')) {
          // Handle display math
          const mathIndex = parseInt(token.text.match(/{{DISPLAY_MATH_(\d+)}}/)![1])
          const latex = equations.display[mathIndex].latex
          // Add as formatted text (OMML conversion would go here)
          paragraph.addChildElement(new TextRun({ text: `$$${latex}$$`, italics: true }))
        } else if (token.text.includes('{{INLINE_MATH_')) {
          // Handle inline math
          const parts = token.text.split(/({{INLINE_MATH_\d+}})/)
          parts.forEach(part => {
            if (part.match(/{{INLINE_MATH_(\d+)}}/)) {
              const mathIndex = parseInt(part.match(/{{INLINE_MATH_(\d+)}}/)![1])
              const latex = equations.inline[mathIndex].latex
              paragraph.addChildElement(new TextRun({ text: `$${latex}$`, italics: true }))
            } else if (part) {
              paragraph.addChildElement(new TextRun({ text: part }))
            }
          })
        } else {
          paragraph.addChildElement(new TextRun({ text: token.text }))
        }
        
        sections.push(paragraph)
        break

      case 'code':
        sections.push(
          new Paragraph({
            text: token.text,
            spacing: { before: 120, after: 120 },
            shading: { fill: colors.code },
          })
        )
        break

      case 'blockquote':
        sections.push(
          new Paragraph({
            text: token.text,
            spacing: { before: 120, after: 120 },
            indent: { left: 720 },
            border: { left: { color: colors.accent, size: 24, style: BorderStyle.SINGLE } },
          })
        )
        break

      case 'list':
        // Handle lists
        token.items.forEach(item => {
          sections.push(
            new Paragraph({
              text: item.text,
              bullet: { level: 0 },
              spacing: { before: 60, after: 60 },
            })
          )
        })
        break
    }
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  })

  // Generate buffer (this would use Packer.toBuffer in actual implementation)
  // For now, return a placeholder
  return Buffer.from('DOCX content would be here')
}

function getHeadingLevel(depth: number): HeadingLevel {
  switch (depth) {
    case 1: return HeadingLevel.HEADING_1
    case 2: return HeadingLevel.HEADING_2
    case 3: return HeadingLevel.HEADING_3
    case 4: return HeadingLevel.HEADING_4
    case 5: return HeadingLevel.HEADING_5
    case 6: return HeadingLevel.HEADING_6
    default: return HeadingLevel.HEADING_1
  }
}
