'use client'

import { useState } from 'react'
import Editor from '@/components/Editor'
import Preview from '@/components/Preview'
import ExportButtons from '@/components/ExportButtons'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Home() {
  const [markdown, setMarkdown] = useState('')
  const [html, setHtml] = useState('')
  const [editedPreviewHTML, setEditedPreviewHTML] = useState('') // Track edited preview content
  const [includeStyling, setIncludeStyling] = useState(true)
  const [includeToc, setIncludeToc] = useState(false)
  const [includePageNumbers, setIncludePageNumbers] = useState(true)
  const [pdfTheme, setPdfTheme] = useState('color')
  const [showHowToUse, setShowHowToUse] = useState(false)

  return (
    <ErrorBoundary>
      <div className="container">
        <header>
          <div className="header-left">
            <div className="logo">Converto</div>
            <p className="tagline">Transform AI-generated content into professional documents</p>
          </div>
          <div className="header-right">
            <button onClick={() => setShowHowToUse(!showHowToUse)} className="btn btn-how-to-use" title="How to Use">
              <span>❓</span> How to Use
            </button>
          </div>
        </header>

      <div className="main-content">
        <Editor 
          markdown={markdown}
          setMarkdown={setMarkdown}
          setHtml={setHtml}
        />
        <Preview 
          html={html} 
          onPreviewEdit={setEditedPreviewHTML}
        />
      </div>

      <ExportButtons 
          markdown={markdown}
          html={html}
          editedPreviewHTML={editedPreviewHTML}
          includeStyling={includeStyling}
          setIncludeStyling={setIncludeStyling}
          includeToc={includeToc}
          setIncludeToc={setIncludeToc}
          includePageNumbers={includePageNumbers}
          setIncludePageNumbers={setIncludePageNumbers}
          pdfTheme={pdfTheme}
          setPdfTheme={setPdfTheme}
        />

      <footer id="howToUseSection" className={showHowToUse ? '' : 'hidden'}>
        <div className="footer-content">
          <h3>How Converto Works</h3>
          <p className="footer-description">Get AI-generated content from ChatGPT, Gemini, Claude, or any AI tool and export them with perfect formatting.</p>
          
          <div className="footer-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Install Extension</h4>
                <p>Download &quot;Markdown Copy&quot; or similar Chrome extension to copy AI content in markdown format</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Copy Content</h4>
                <p>Copy your generated content via the extension button - it preserves all formatting, equations, and code blocks</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Paste & Export</h4>
                <p>Simply paste here and export to DOCX, HTML, or PDF with one click - all formatting preserved perfectly!</p>
              </div>
            </div>
          </div>
          
          <div className="features-section">
            <h3>Core Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">📝</span>
                <h4>Markdown Conversion</h4>
                <p>Advanced markdown parsing with support for tables, math, and code</p>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🧮</span>
                <h4>Math Support</h4>
                <p>Renders mathematical equations (inline or display) using KaTeX</p>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">💻</span>
                <h4>Code Highlighting</h4>
                <p>Provides code blocks with syntax highlighting using Highlight.js</p>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <h4>Content Elements</h4>
                <p>Supports tables, lists, formatted text, highlights, and blockquotes</p>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <h4>Content Statistics</h4>
                <p>Provides word count, character count, paragraph count, heading count, and reading time</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>Converto • Professional Document Export Tool • Preserves all formatting</p>
          </div>
        </div>
      </footer>
      </div>
    </ErrorBoundary>
  )
}
