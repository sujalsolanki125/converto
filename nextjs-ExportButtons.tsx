'use client'

import { useState } from 'react'

interface ExportButtonsProps {
  markdown: string
  theme: 'light' | 'dark'
}

export default function ExportButtons({ markdown, theme }: ExportButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [title, setTitle] = useState('Document')
  const [author, setAuthor] = useState('')

  const handleExport = async (format: 'docx' | 'pdf' | 'html') => {
    if (!markdown.trim()) {
      alert('Please enter some content first')
      return
    }

    setLoading(format)

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: markdown,
          title,
          author,
          theme,
          date: new Date().toLocaleDateString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert(`${format.toUpperCase()} exported successfully!`)
    } catch (error) {
      console.error('Export error:', error)
      alert(`Failed to export ${format.toUpperCase()}: ${error}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      <h3 className="text-xl font-semibold text-cyan-400 mb-4">Export Document</h3>
      
      {/* Document Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900/50 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-400/50 focus:outline-none"
            placeholder="Enter document title"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Author (Optional)</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-slate-900/50 text-white px-4 py-2 rounded-lg border border-white/10 focus:border-cyan-400/50 focus:outline-none"
            placeholder="Enter author name"
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleExport('docx')}
          disabled={loading !== null}
          className="export-btn bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {loading === 'docx' ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span> Exporting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              📄 Export to DOCX
            </span>
          )}
        </button>

        <button
          onClick={() => handleExport('pdf')}
          disabled={loading !== null}
          className="export-btn bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
        >
          {loading === 'pdf' ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span> Exporting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              📕 Export to PDF
            </span>
          )}
        </button>

        <button
          onClick={() => handleExport('html')}
          disabled={loading !== null}
          className="export-btn bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          {loading === 'html' ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⚙️</span> Exporting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              🌐 Export to HTML
            </span>
          )}
        </button>
      </div>

      {/* Features List */}
      <div className="mt-6 p-4 bg-slate-900/30 rounded-xl">
        <p className="text-sm text-gray-400 mb-2">✨ Server-Side Processing Features:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>✅ Native DOCX with editable equations (OMML format)</li>
          <li>✅ High-quality PDF with Puppeteer rendering</li>
          <li>✅ Preserved formatting, tables, and code highlighting</li>
          <li>✅ Math equations rendered perfectly in all formats</li>
        </ul>
      </div>
    </div>
  )
}
