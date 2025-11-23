'use client'

import { useState } from 'react'
import Editor from '@/components/Editor'
import Preview from '@/components/Preview'
import ExportButtons from '@/components/ExportButtons'

export default function Home() {
  const [markdown, setMarkdown] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="glass-card rounded-3xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Converto
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Transform AI-generated content into professional documents
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="glass-button p-3 rounded-full"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Editor */}
          <Editor value={markdown} onChange={setMarkdown} />
          
          {/* Preview */}
          <Preview content={markdown} theme={theme} />
        </div>

        {/* Export Section */}
        <ExportButtons markdown={markdown} theme={theme} />
      </div>
    </main>
  )
}
