import { NextRequest, NextResponse } from 'next/server'
import { generateDocx } from '@/lib/docx-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title, author, date, theme } = body

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Generate DOCX
    const docxBuffer = await generateDocx({
      content,
      title,
      author,
      date,
      theme,
    })

    // Return as downloadable file
    return new NextResponse(docxBuffer, {
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
