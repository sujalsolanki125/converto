import { NextRequest, NextResponse } from 'next/server'
import { generatePdf } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const { content, title = 'Document', author = '', date = new Date().toLocaleDateString(), options = {} } = body
    const theme = options.theme || 'color'

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

    console.log(`[PDF Export] Generating PDF for document: "${title}" (${content.length} chars)`)

    // Generate PDF
    const pdfBuffer = await generatePdf({
      content,
      title,
      author,
      date,
      theme,
    })

    console.log(`[PDF Export] Successfully generated PDF (${pdfBuffer.length} bytes)`)

    // Return as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'document'}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('[PDF Export] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF', 
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
