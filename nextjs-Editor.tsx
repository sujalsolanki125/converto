'use client'

import { useState, useEffect } from 'react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 0 })

  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0
    const chars = value.length
    const lines = value.split('\n').length
    setStats({ words, chars, lines })
  }, [value])

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || placeholder
    
    let newText = ''
    let cursorOffset = 0

    switch (syntax) {
      case 'bold':
        newText = `**${selectedText}**`
        cursorOffset = 2
        break
      case 'italic':
        newText = `*${selectedText}*`
        cursorOffset = 1
        break
      case 'code':
        newText = `\`${selectedText}\``
        cursorOffset = 1
        break
      case 'codeblock':
        newText = `\`\`\`\n${selectedText}\n\`\`\``
        cursorOffset = 3
        break
      case 'equation':
        newText = `$${selectedText}$`
        cursorOffset = 1
        break
      case 'equation-block':
        newText = `$$\n${selectedText}\n$$`
        cursorOffset = 3
        break
      case 'table':
        newText = `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |`
        break
      case 'link':
        newText = `[${selectedText || 'Link Text'}](url)`
        break
      case 'image':
        newText = `![${selectedText || 'Alt Text'}](image-url)`
        break
      default:
        newText = selectedText
    }

    const newValue = value.substring(0, start) + newText + value.substring(end)
    onChange(newValue)

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      if (!value.substring(start, end)) {
        textarea.setSelectionRange(start + cursorOffset, start + cursorOffset + (placeholder.length || 0))
      }
    }, 0)
  }

  const loadSample = () => {
    const sample = `# Sample Document

## Mathematical Equations

Inline equation: $E = mc^2$

Display equation:
$$
\\int_{a}^{b} f(x) dx = F(b) - F(a)
$$

## Code Block

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## Table

| Feature | Status |
|---------|--------|
| LaTeX | ✅ |
| Tables | ✅ |
| Code | ✅ |

## Text Formatting

**Bold text**, *italic text*, and \`inline code\`.

> This is a blockquote with important information.
`
    onChange(sample)
  }

  return (
    <div className="glass-card rounded-3xl p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/10">
        <button onClick={() => insertMarkdown('bold', 'Bold')} className="toolbar-btn" title="Bold">
          <strong>B</strong>
        </button>
        <button onClick={() => insertMarkdown('italic', 'Italic')} className="toolbar-btn" title="Italic">
          <em>I</em>
        </button>
        <button onClick={() => insertMarkdown('code', 'code')} className="toolbar-btn" title="Code">
          {'</>'}
        </button>
        <button onClick={() => insertMarkdown('codeblock', 'code')} className="toolbar-btn" title="Code Block">
          💻
        </button>
        <button onClick={() => insertMarkdown('equation', 'x^2')} className="toolbar-btn" title="Inline Equation">
          ∑
        </button>
        <button onClick={() => insertMarkdown('equation-block', '\\frac{a}{b}')} className="toolbar-btn" title="Display Equation">
          ∫
        </button>
        <button onClick={() => insertMarkdown('table')} className="toolbar-btn" title="Table">
          📊
        </button>
        <button onClick={() => insertMarkdown('link')} className="toolbar-btn" title="Link">
          🔗
        </button>
        <button onClick={() => insertMarkdown('image')} className="toolbar-btn" title="Image">
          🖼️
        </button>
        <button onClick={loadSample} className="toolbar-btn ml-auto" title="Load Sample">
          📄 Sample
        </button>
      </div>

      {/* Editor */}
      <textarea
        id="markdown-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-[70vh] bg-slate-900/50 text-white font-mono text-sm p-4 rounded-xl border border-white/10 focus:border-cyan-400/50 focus:outline-none resize-none"
        placeholder="Paste your content from ChatGPT, Gemini, Claude or any AI tool here...

Supports:
• Mathematical equations ($inline$ or $$display$$)
• Code blocks with syntax highlighting
• Tables, lists, and formatted text
• Highlights and special formatting"
      />

      {/* Stats */}
      <div className="flex gap-6 mt-4 text-sm text-gray-400">
        <span>Words: <strong className="text-cyan-400">{stats.words}</strong></span>
        <span>Characters: <strong className="text-cyan-400">{stats.chars}</strong></span>
        <span>Lines: <strong className="text-cyan-400">{stats.lines}</strong></span>
      </div>
    </div>
  )
}
