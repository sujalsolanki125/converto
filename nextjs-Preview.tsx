'use client'

import { useEffect, useRef } from 'react'
import { convertMarkdown } from '@/lib/markdown-converter'

interface PreviewProps {
  content: string
  theme: 'light' | 'dark'
}

export default function Preview({ content, theme }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (previewRef.current && content) {
      const html = convertMarkdown(content)
      previewRef.current.innerHTML = html

      // Apply syntax highlighting
      if (typeof window !== 'undefined' && (window as any).hljs) {
        previewRef.current.querySelectorAll('pre code').forEach((block) => {
          ;(window as any).hljs.highlightElement(block)
        })
      }
    } else if (previewRef.current) {
      previewRef.current.innerHTML = '<p class="text-gray-500 text-center p-8">Your formatted content will appear here...</p>'
    }
  }, [content])

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
        <h3 className="text-xl font-semibold text-cyan-400">Live Preview</h3>
        <span className="text-xs text-gray-500 px-3 py-1 bg-slate-900/50 rounded-full">
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </span>
      </div>
      
      <div
        ref={previewRef}
        className={`preview-content h-[70vh] overflow-y-auto overflow-x-auto rounded-xl p-6 ${
          theme === 'dark' 
            ? 'bg-slate-900/50 text-white' 
            : 'bg-white text-gray-900'
        }`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: theme === 'dark' ? '#66e4ff33 transparent' : '#66666633 transparent'
        }}
      />
    </div>
  )
}
