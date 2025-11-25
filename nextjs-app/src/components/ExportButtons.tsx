'use client'

interface ExportButtonsProps {
  markdown: string
  html: string
  includeStyling: boolean
  setIncludeStyling: (value: boolean) => void
  includeToc: boolean
  setIncludeToc: (value: boolean) => void
  includePageNumbers: boolean
  setIncludePageNumbers: (value: boolean) => void
  pdfTheme: string
  setPdfTheme: (value: string) => void
}

export default function ExportButtons({
  markdown,
  html,
  includeStyling,
  setIncludeStyling,
  includeToc,
  setIncludeToc,
  includePageNumbers,
  setIncludePageNumbers,
  pdfTheme,
  setPdfTheme
}: ExportButtonsProps) {

  const exportToHTML = async () => {
    if (!markdown.trim()) {
      alert('Please enter some content first')
      return
    }

    try {
      const response = await fetch('/api/export/html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdown,
          title: 'Document',
          options: {
            includeStyles: includeStyling,
            includeTOC: includeToc,
            theme: pdfTheme
          }
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.html'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Export failed: ' + (error as Error).message)
    }
  }

  const exportToDOCX = async () => {
    if (!markdown.trim()) {
      alert('Please enter some content first')
      return
    }

    try {
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdown,
          title: 'Document',
          author: 'Converto User',
          date: new Date().toLocaleDateString(),
          options: {
            includeStyles: includeStyling,
            includeTOC: includeToc,
            pageNumbers: includePageNumbers,
            theme: pdfTheme
          }
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.docx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Export failed: ' + (error as Error).message)
    }
  }

  const exportToPDF = async () => {
    if (!markdown.trim()) {
      alert('Please enter some content first')
      return
    }

    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: markdown,
          title: 'Document',
          author: 'Converto User',
          date: new Date().toLocaleDateString(),
          options: {
            includeStyles: includeStyling,
            includeTOC: includeToc,
            pageNumbers: includePageNumbers,
            theme: pdfTheme
          }
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Export failed: ' + (error as Error).message)
    }
  }

  const copyFormattedContent = () => {
    if (!html.trim()) {
      alert('Please enter some content first')
      return
    }

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    document.body.appendChild(tempDiv)

    const range = document.createRange()
    range.selectNodeContents(tempDiv)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    try {
      document.execCommand('copy')
      alert('Formatted content copied to clipboard!')
    } catch (err) {
      alert('Failed to copy content')
    }

    document.body.removeChild(tempDiv)
    selection?.removeAllRanges()
  }

  return (
    <section className="export-section">
      <h3>💾 Export Options</h3>
      <div className="export-buttons">
        <button onClick={exportToHTML} className="btn btn-export btn-html">
          🌐 Export to HTML
        </button>
        <button onClick={exportToDOCX} className="btn btn-export btn-docx">
          📄 Export to DOCX
        </button>
        <button onClick={exportToPDF} className="btn btn-export btn-pdf">
          📕 Export to PDF
        </button>
        <button onClick={copyFormattedContent} className="btn btn-export btn-copy">
          📋 Copy Formatted
        </button>
      </div>
      
      <div className="export-options">
        <label>
          <input 
            type="checkbox" 
            checked={includeStyling}
            onChange={(e) => setIncludeStyling(e.target.checked)}
          /> Include Styling
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={includeToc}
            onChange={(e) => setIncludeToc(e.target.checked)}
          /> Include Table of Contents
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={includePageNumbers}
            onChange={(e) => setIncludePageNumbers(e.target.checked)}
          /> Page Numbers
        </label>
      </div>
      
      <div className="export-options" style={{marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px'}}>
        <label style={{fontWeight: 600, color: '#66e4ff', marginBottom: '10px', display: 'block', fontSize: '14px'}}>
          🎨 Export Theme (Choose before exporting):
        </label>
        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
          <label 
            style={{
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              padding: '8px 15px', 
              background: 'rgba(102, 228, 255, 0.1)', 
              borderRadius: '8px', 
              border: pdfTheme === 'color' ? '2px solid #66e4ff' : '2px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            <input 
              type="radio" 
              name="exportTheme" 
              value="color" 
              checked={pdfTheme === 'color'}
              onChange={(e) => setPdfTheme(e.target.value)}
              style={{marginRight: '8px'}}
            /> 
            <span style={{fontWeight: 500}}>🌈 Color (Dark Theme)</span>
          </label>
          <label 
            style={{
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              padding: '8px 15px', 
              background: 'rgba(217, 70, 239, 0.1)', 
              borderRadius: '8px', 
              border: pdfTheme === 'bw' ? '2px solid #d946ef' : '2px solid transparent',
              transition: 'all 0.3s'
            }}
          >
            <input 
              type="radio" 
              name="exportTheme" 
              value="bw" 
              checked={pdfTheme === 'bw'}
              onChange={(e) => setPdfTheme(e.target.value)}
              style={{marginRight: '8px'}}
            /> 
            <span style={{fontWeight: 500}}>⚫ Black & White (Print-Friendly)</span>
          </label>
        </div>
        <p style={{marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic'}}>
          💡 Select your preferred theme, then click any export button above
        </p>
        <div style={{marginTop: '10px', padding: '10px', background: 'rgba(251, 191, 36, 0.1)', borderLeft: '3px solid #fbbf24', borderRadius: '4px'}}>
          <p style={{margin: 0, fontSize: '12px', color: '#fbbf24', lineHeight: 1.5}}>
            <strong>📐 Note for Math Formulas:</strong> If your content contains mathematical equations or formulas, 
            use <strong>🌈 Color Theme</strong> for PDF export to ensure formulas are visible. 
            For DOCX export, both themes work perfectly.
          </p>
        </div>
      </div>
    </section>
  )
}
