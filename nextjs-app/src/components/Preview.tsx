'use client'

import { useState, useEffect, useRef } from 'react'

interface PreviewProps {
  html: string
}

export default function Preview({ html }: PreviewProps) {
  const [editMode, setEditMode] = useState(false)
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    paragraphs: 0,
    headings: 0,
    readTime: 0
  })
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set HTML content (math already rendered server-side by markdown converter)
    if (previewRef.current) {
      // Set HTML content or welcome message
      if (html) {
        previewRef.current.innerHTML = html
      } else {
        previewRef.current.innerHTML = `
          <div style="text-align: center; padding: 60px 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
            <h2 style="color: #66e4ff; margin-bottom: 16px; font-weight: 700; filter: drop-shadow(0 0 8px rgba(102, 228, 255, 0.3)); letter-spacing: -0.02em;">Welcome to Converto</h2>
            <p style="font-size: 16px; margin-bottom: 32px; line-height: 1.6; color: rgba(255, 255, 255, 0.8); letter-spacing: 0.01em;">Transform AI-generated content into professional documents</p>
            
            <div style="max-width: 600px; margin: 0 auto; text-align: left;">
              <h3 style="color: #66e4ff; margin-bottom: 16px; font-size: 18px; font-weight: 600; filter: drop-shadow(0 0 6px rgba(102, 228, 255, 0.2));">✨ What We Offer:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                  <strong style="color: rgba(255, 255, 255, 0.95); font-weight: 600;">📄 Export to Multiple Formats</strong><br>
                  <span style="font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.01em;">Download your content as DOCX, HTML, or PDF</span>
                </li>
                <li style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                  <strong style="color: rgba(255, 255, 255, 0.95); font-weight: 600;">🧮 Mathematical Equations</strong><br>
                  <span style="font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.01em;">Full LaTeX support for complex formulas and equations</span>
                </li>
                <li style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                  <strong style="color: rgba(255, 255, 255, 0.95); font-weight: 600;">💻 Syntax Highlighting</strong><br>
                  <span style="font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.01em;">Beautiful code blocks with 190+ language support</span>
                </li>
                <li style="padding: 14px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                  <strong style="color: rgba(255, 255, 255, 0.95); font-weight: 600;">📊 Tables & Formatting</strong><br>
                  <span style="font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.01em;">Professional tables, lists, and text formatting</span>
                </li>
                <li style="padding: 14px 0;">
                  <strong style="color: rgba(255, 255, 255, 0.95); font-weight: 600;">🎨 Preserve Styling</strong><br>
                  <span style="font-size: 14px; color: rgba(255, 255, 255, 0.7); letter-spacing: 0.01em;">All formatting maintained in exports</span>
                </li>
              </ul>
            </div>
            
            <div style="margin-top: 40px;">
              <p style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-bottom: 16px; letter-spacing: 0.01em;">Get started by pasting your content or click the "Load Sample" button above</p>
            </div>
          </div>
        `
      }

      // Wait for DOM to update before applying additional processing
      requestAnimationFrame(() => {
        if (!previewRef.current) return

        // Highlight code blocks
        if (typeof window !== 'undefined' && (window as any).hljs) {
          previewRef.current.querySelectorAll('pre code').forEach((block) => {
            (window as any).hljs.highlightElement(block)
          })
        }
      })

      // Calculate statistics
      calculateStats()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html])

  const calculateStats = () => {
    if (!previewRef.current) return

    const text = previewRef.current.textContent || ''
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
    const characters = text.length
    const paragraphs = (html.match(/<p>/g) || []).length
    const headings = (html.match(/<h[1-6]>/g) || []).length
    const readTime = Math.ceil(words / 200) // Average reading speed: 200 words per minute

    setStats({
      words,
      characters,
      paragraphs,
      headings,
      readTime
    })
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
    if (previewRef.current) {
      previewRef.current.contentEditable = (!editMode).toString()
    }
  }

  const refreshPreview = () => {
    // Force re-render with KaTeX
    if (previewRef.current && html) {
      previewRef.current.innerHTML = html

      // Re-render math
      try {
        if (typeof window !== 'undefined' && (window as any).renderMathInElement) {
          (window as any).renderMathInElement(previewRef.current, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\[', right: '\\]', display: true},
              {left: '\\(', right: '\\)', display: false}
            ],
            throwOnError: false,
            strict: false
          })
        }
      } catch (err) {
        console.error('KaTeX rendering error:', err)
      }

      // Re-highlight code
      if (typeof window !== 'undefined' && (window as any).hljs) {
        previewRef.current.querySelectorAll('pre code').forEach((block) => {
          (window as any).hljs.highlightElement(block)
        })
      }
    }
  }

  const formatText = (command: string) => {
    document.execCommand(command, false)
  }

  const deleteSelectedText = () => {
    document.execCommand('delete', false)
  }

  const undoEdit = () => {
    document.execCommand('undo', false)
  }

  const redoEdit = () => {
    document.execCommand('redo', false)
  }

  return (
    <section className="preview-section">
      <div className="preview-toolbar">
        <h3>Live Preview</h3>
        <div className="preview-toolbar-actions">
          <button 
            onClick={toggleEditMode} 
            className="btn btn-secondary" 
            id="editModeBtn"
          >
            ✏️ {editMode ? 'Disable Editing' : 'Enable Editing'}
          </button>
          <button onClick={refreshPreview} className="btn btn-primary">
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {/* Editing Toolbar */}
      <div id="editToolbar" className={`edit-toolbar ${editMode ? '' : 'hidden'}`}>
        <div className="edit-toolbar-group">
          <button onClick={() => formatText('bold')} className="btn btn-tool" title="Bold">
            <strong>B</strong>
          </button>
          <button onClick={() => formatText('italic')} className="btn btn-tool" title="Italic">
            <em>I</em>
          </button>
          <button onClick={() => formatText('underline')} className="btn btn-tool" title="Underline">
            <u>U</u>
          </button>
          <button onClick={() => formatText('strikethrough')} className="btn btn-tool" title="Strikethrough">
            <s>S</s>
          </button>
        </div>
        <div className="edit-toolbar-separator"></div>
        <div className="edit-toolbar-group">
          <button onClick={() => formatText('removeFormat')} className="btn btn-tool" title="Remove Formatting">
            🧹 Clear
          </button>
          <button onClick={deleteSelectedText} className="btn btn-tool" title="Delete Selected Text">
            🗑️ Delete
          </button>
        </div>
        <div className="edit-toolbar-separator"></div>
        <div className="edit-toolbar-group">
          <button onClick={undoEdit} className="btn btn-tool" title="Undo">
            ↶ Undo
          </button>
          <button onClick={redoEdit} className="btn btn-tool" title="Redo">
            ↷ Redo
          </button>
        </div>
      </div>
      
      {/* Content Statistics */}
      <div id="contentStats" className={`content-stats ${html ? '' : 'hidden'}`}>
        <div className="stat-item">
          <span className="stat-value">{stats.words}</span>
          <span className="stat-label">Words</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.characters}</span>
          <span className="stat-label">Characters</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.paragraphs}</span>
          <span className="stat-label">Paragraphs</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.headings}</span>
          <span className="stat-label">Headings</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.readTime}</span>
          <span className="stat-label">Min Read</span>
        </div>
      </div>
      
      <div 
        ref={previewRef}
        id="preview" 
        className="preview-container"
      />
    </section>
  )
}
