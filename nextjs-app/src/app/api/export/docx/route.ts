import { NextRequest, NextResponse } from 'next/server'
import { generateDocx } from '@/lib/docx-generator'
import { convertMarkdown } from '@/lib/markdown-converter'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { content, title = 'Document', author = '', date = new Date().toLocaleDateString(), options = {} } = body
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

    console.log(`[DOCX Export] Generating DOCX for document: "${title}" (${content.length} chars, Pre-edited: ${isPreEditedHTML})`)

    // Convert markdown to HTML first or use pre-edited HTML
    const htmlContent = isPreEditedHTML ? content : convertMarkdown(content)

    // Generate DOCX
    const docxBuffer = await generateDocx({
      content: htmlContent,
      title,
      author,
      date,
      theme,
    })

    const bufferData = Buffer.from(docxBuffer)
    console.log(`[DOCX Export] Successfully generated DOCX (${bufferData.length} bytes)`)

    // Return as downloadable file
    return new NextResponse(bufferData, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'document'}.docx"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[DOCX Export] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate DOCX', 
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
