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
      
      // Add paste event listener when edit mode is enabled
      if (!editMode) {
        previewRef.current.addEventListener('paste', handlePasteInPreview)
      } else {
        previewRef.current.removeEventListener('paste', handlePasteInPreview)
      }
    }
  }

  const handlePasteInPreview = (event: ClipboardEvent) => {
    const clipboardData = event.clipboardData
    if (!clipboardData) return

    // First check for HTML content (formatted text, equations, etc.)
    const htmlData = clipboardData.getData('text/html')
    if (htmlData && htmlData.trim()) {
      event.preventDefault()
      insertRichContentToPreview(htmlData)
      return
    }

    // Check for images
    const items = clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        event.preventDefault()
        const file = items[i].getAsFile()
        if (file) {
          insertImageToPreview(file)
        }
        return
      }
    }

    // If plain text, allow default paste behavior
  }

  const insertRichContentToPreview = (htmlContent: string) => {
    try {
      // Create a temporary container to parse the HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent

      // Process and clean the content while preserving important formatting
      const processedContent = processRichContent(tempDiv)

      // Insert at cursor position
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()

        // Insert each processed node
        Array.from(processedContent.childNodes).forEach(node => {
          const clonedNode = node.cloneNode(true)
          range.insertNode(clonedNode)
          range.setStartAfter(clonedNode)
        })

        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      } else if (previewRef.current) {
        // If no selection, append to preview
        Array.from(processedContent.childNodes).forEach(node => {
          previewRef.current?.appendChild(node.cloneNode(true))
        })
      }

      // Re-render math equations if any
      if (typeof window !== 'undefined' && (window as any).renderMathInElement && previewRef.current) {
        (window as any).renderMathInElement(previewRef.current, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false
        })
      }

      // Re-apply syntax highlighting if code blocks exist
      if (typeof window !== 'undefined' && (window as any).hljs && previewRef.current) {
        previewRef.current.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
          (window as any).hljs.highlightElement(block)
        })
      }

      console.log('✓ Content pasted successfully with formatting preserved!')
    } catch (error) {
      console.error('Error pasting rich content:', error)
    }
  }

  const processRichContent = (container: HTMLElement): HTMLElement => {
    const processed = document.createElement('div')

    const walkNodes = (node: Node, parent: HTMLElement) => {
      if (node.nodeType === Node.TEXT_NODE) {
        parent.appendChild(node.cloneNode(true))
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement
        const tagName = element.tagName.toLowerCase()

        // List of tags to preserve
        const preserveTags = [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'div', 'span',
          'strong', 'b', 'em', 'i', 'u', 's', 'mark',
          'ul', 'ol', 'li',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'pre', 'code',
          'blockquote',
          'a', 'img',
          'br', 'hr'
        ]

        if (preserveTags.includes(tagName)) {
          const newElement = document.createElement(tagName)

          // Preserve specific attributes
          if (tagName === 'a' && element.hasAttribute('href')) {
            newElement.setAttribute('href', element.getAttribute('href') || '')
          }
          if (tagName === 'img' && element.hasAttribute('src')) {
            newElement.setAttribute('src', element.getAttribute('src') || '')
            newElement.style.maxWidth = '100%'
            newElement.style.height = 'auto'
          }
          if (tagName === 'code' && element.hasAttribute('class')) {
            const classAttr = element.getAttribute('class')
            if (classAttr && (classAttr.includes('language-') || classAttr.includes('hljs'))) {
              newElement.setAttribute('class', classAttr)
            }
          }

          // Preserve inline styles for highlights and special formatting
          if (element.hasAttribute('style')) {
            const style = element.getAttribute('style')
            if (style && style.includes('background')) {
              newElement.setAttribute('style', style)
            }
          }

          // Preserve classes for highlights and KaTeX
          if (element.hasAttribute('class')) {
            const classAttr = element.getAttribute('class')
            if (classAttr && (classAttr.includes('highlight-') || classAttr.includes('katex'))) {
              newElement.setAttribute('class', classAttr)
            }
          }

          // Special handling for KaTeX math
          if (element.classList && (element.classList.contains('katex') || element.classList.contains('katex-display') || element.classList.contains('katex-html'))) {
            parent.appendChild(element.cloneNode(true))
            return
          }

          // Recursively process children
          Array.from(element.childNodes).forEach(child => walkNodes(child, newElement))
          parent.appendChild(newElement)
        } else {
          // For other tags, just process children
          Array.from(element.childNodes).forEach(child => walkNodes(child, parent))
        }
      }
    }

    Array.from(container.childNodes).forEach(child => walkNodes(child, processed))
    return processed
  }

  const insertImageToPreview = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Data = e.target?.result as string
      const imgElement = document.createElement('img')
      imgElement.src = base64Data
      imgElement.style.maxWidth = '100%'
      imgElement.style.height = 'auto'
      imgElement.style.margin = '10px 0'
      imgElement.style.borderRadius = '8px'
      imgElement.style.border = '1px solid rgba(102, 228, 255, 0.2)'

      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(imgElement)
        range.setStartAfter(imgElement)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      } else if (previewRef.current) {
        previewRef.current.appendChild(imgElement)
      }
    }
    reader.readAsDataURL(file)
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
      {/* Paste Instructions */}
      {editMode && (
        <div className="paste-instructions" style={{ marginBottom: '12px', animation: 'slideDown 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(102, 228, 255, 0.1)', borderLeft: '3px solid #66e4ff', borderRadius: '4px' }}>
            <span style={{ fontSize: '24px' }}>📋</span>
            <div>
              <strong style={{ color: '#66e4ff' }}>Direct Paste Mode Active!</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Copy formatted content (with equations, highlights, tables) from anywhere and paste directly here. All styling will be preserved!
              </p>
            </div>
          </div>
        </div>
      )}

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
