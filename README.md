# BibCit - Advanced Content Export & Citation Tool

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Overview

**BibCit** is a powerful, browser-based content generation and export tool that enables seamless creation, formatting, and export of academic and professional documents. It supports rich text formatting, mathematical equations, code syntax highlighting, tables, and professional citations in multiple styles.

## ✨ Key Features

### 📝 Content Generation & Formatting
- **Rich Text Support**: Bold, italic, underline, strikethrough, superscript, subscript
- **Mathematical Equations**: LaTeX support with KaTeX rendering (inline and display modes)
- **Code Syntax Highlighting**: Support for 190+ programming languages via Highlight.js
- **Tables**: Professional table formatting with headers and styling
- **Colored Backgrounds**: Highlight text with custom colors (yellow, green, blue, pink)
- **Lists & Blockquotes**: Ordered/unordered lists and styled quotations

### 🔄 Markdown to HTML Conversion
- **One-Click Conversion**: Seamless Markdown to HTML transformation
- **Live Preview**: Real-time rendering with syntax highlighting
- **Table of Contents**: Auto-generated TOC with navigation links
- **Statistics**: Word count, reading time, character count

### 📤 Multi-Format Export
- **HTML Export**: Standalone HTML files with embedded CSS
- **DOCX Export**: Microsoft Word compatible documents with full formatting
- **PDF Export**: High-quality PDF generation with preserved styling
- **Clipboard Copy**: Copy formatted content with styles intact

### 📚 Citation Automation
- **Multiple Styles**: APA 7th, MLA 9th, Chicago, Harvard, IEEE
- **Source Types**: Journal articles, books, websites, conference papers
- **BibTeX & RIS Export**: Compatible with reference managers
- **One-Click Generation**: Fast and accurate citation creation

### 🎨 Formatting Preservation
- **Tables**: Borders, headers, alternating row colors
- **Code Blocks**: Syntax highlighting maintained across formats
- **Math Equations**: Rendered equations in all export formats
- **Inline Styles**: Bold, italic, colors, highlights preserved

## 📋 Installation

### Option 1: Direct Use (No Installation)
Simply open `index.html` in your web browser. All dependencies are loaded from CDNs.

### Option 2: Local Development
1. Clone or download the repository:
```powershell
cd d:\bibcit
```

2. Install dependencies (optional, for offline use):
```powershell
npm install
```

3. Start a local server:
```powershell
npm start
```

4. Open your browser to `http://localhost:8080`

## 🎯 Usage Guide

### Basic Workflow

1. **Enter Content**: Type or paste your content in Markdown format in the left editor
2. **Preview**: Click "Refresh Preview" to see formatted output
3. **Add Citations**: Use the citation generator to create references
4. **Export**: Choose your desired format (HTML, DOCX, or PDF)

### Markdown Examples

#### Headers
```markdown
# Heading 1
## Heading 2
### Heading 3
```

#### Text Formatting
```markdown
**Bold text**
*Italic text*
***Bold and italic***
`Inline code`
```

#### Math Equations
```markdown
Inline: $E = mc^2$

Display:
$$
\int_{a}^{b} f(x) dx = F(b) - F(a)
$$
```

#### Code Blocks
````markdown
```javascript
function hello() {
    console.log('Hello World!');
}
```
````

#### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

#### Highlights
```markdown
<span class="highlight-yellow">Important text</span>
<span class="highlight-green">Positive result</span>
<span class="highlight-blue">Note</span>
<span class="highlight-pink">Warning</span>
```

### Citation Generation

1. Select citation type (Article, Book, Website, Conference)
2. Select citation style (APA, MLA, Chicago, Harvard, IEEE)
3. Fill in required fields:
   - Authors (use semicolons for multiple: "Smith, J.; Doe, A.")
   - Year
   - Title
   - Source/Publisher
   - Optional: Volume, Pages, DOI, URL
4. Click "Generate Citation"
5. Click "Add to Document" or "Copy"

### Export Options

#### HTML Export
- ✅ Standalone HTML file with embedded CSS
- ✅ All formatting preserved
- ✅ Math equations rendered
- ✅ Syntax highlighting included

#### DOCX Export
- ✅ Microsoft Word compatible
- ✅ Tables with borders
- ✅ Headers with proper styling
- ✅ Code blocks formatted
- ✅ Page numbers optional

#### PDF Export
- ✅ High-quality A4 format
- ✅ Professional typography
- ✅ All visual elements preserved
- ✅ Embedded fonts

## 📁 File Structure

```
bibcit/
├── index.html              # Main application interface
├── styles.css              # Application styling
├── package.json            # Project configuration
├── README.md              # This file
├── app.js                 # Main application logic
├── content-generator.js   # Content creation module
├── markdown-converter.js  # Markdown parsing & conversion
├── citation-generator.js  # Citation formatting (APA, MLA, etc.)
└── export-handler.js      # Export functionality (DOCX, HTML, PDF)
```

## 🛠️ Technologies Used

- **Marked.js**: Markdown parsing
- **KaTeX**: Math equation rendering
- **Highlight.js**: Code syntax highlighting
- **docx.js**: DOCX generation
- **html2pdf.js**: PDF export
- **FileSaver.js**: File download handling

## 📖 Supported Citation Styles

### APA 7th Edition
```
Smith, J., & Doe, A. (2023). Article title. Journal Name, 45(2), 123-145. https://doi.org/10.1234/example
```

### MLA 9th Edition
```
Smith, J., and A. Doe. "Article Title." Journal Name, vol. 45, no. 2, 2023, pp. 123-145.
```

### Chicago Style
```
Smith, J., and A. Doe. "Article Title." Journal Name 45, no. 2 (2023): 123-145.
```

### Harvard Style
```
Smith, J. and Doe, A. (2023) 'Article title', Journal Name, 45(2), pp. 123-145.
```

### IEEE Style
```
J. Smith and A. Doe, "Article title," Journal Name, vol. 45, no. 2, pp. 123-145, 2023.
```

## 🎨 Customization

### Modify Styling
Edit `styles.css` to customize colors, fonts, and layout:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    /* Add your custom colors */
}
```

### Add Citation Styles
Extend `citation-generator.js` with new formatting methods:
```javascript
generateCUSTOM(data, type) {
    // Your custom citation format
}
```

## 🔧 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📝 Use Cases

- 📄 Academic papers and research documents
- 📊 Technical reports with code and equations
- 📚 Documentation with multiple formats
- 🎓 Student assignments and theses
- 💼 Professional presentations
- 📖 Blog posts with code examples

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- KaTeX for beautiful math rendering
- Highlight.js for comprehensive syntax highlighting
- Marked.js for robust Markdown parsing
- The open-source community

## 📧 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Check existing documentation
- Review sample content

## 🚀 Quick Start Example

Try this sample content to see all features:

```markdown
# My Research Paper

## Abstract
This paper presents **important findings** using *advanced methods*.

## Methodology
The equation for our model is:
$$
y = \beta_0 + \beta_1 x + \epsilon
$$

## Results
| Treatment | Mean | P-value |
|-----------|------|---------|
| Control   | 45.2 | -       |
| Test      | 52.7 | 0.001   |

## Code
```python
def analyze(data):
    return statistics.mean(data)
```

## References
Smith, J. (2023). Research Methods. Academic Press.
```

---

**Built with ❤️ for researchers, students, and content creators**
