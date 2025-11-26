import { NextRequest, NextResponse } from 'next/server'
import { generateDocx } from '@/lib/docx-generator'
import { convertMarkdown } from '@/lib/markdown-converter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title = 'Document', author = '', date = new Date().toLocaleDateString(), options = {} } = body
    const theme = options.theme || 'color'

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Convert markdown to HTML first (like the original app does)
    const htmlContent = convertMarkdown(content)

    // Generate DOCX
    const docxBuffer = await generateDocx({
      content: htmlContent,
      title,
      author,
      date,
      theme,
    })

    // Return as downloadable file
    return new NextResponse(Buffer.from(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title?.toLowerCase().replace(/\s+/g, '-') || 'document'}.docx"`,
      },
    })
  } catch (error) {
    console.error('DOCX generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate DOCX', details: String(error) },
      { status: 500 }
    )
  }
}
