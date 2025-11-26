'use client'

import { useEffect, useRef } from 'react'
import { convertMarkdown } from '@/lib/markdown-converter'
// @ts-ignore
import hljs from 'highlight.js'

interface EditorProps {
  markdown: string
  setMarkdown: (value: string) => void
  setHtml: (value: string) => void
}

export default function Editor({ markdown, setMarkdown, setHtml }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Update preview whenever markdown changes using our converter
    try {
      const html = convertMarkdown(markdown)
      setHtml(html)
    } catch (error) {
      console.error('Error parsing markdown:', error)
    }
  }, [markdown, setHtml])

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = textarea.value
    
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
    setMarkdown(newValue)
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + text.length
    }, 0)
  }

  const insertTable = () => {
    const template = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |
`
    insertAtCursor(template)
  }

  const insertEquation = () => {
    const template = `
$$
\\int_{a}^{b} f(x) dx = F(b) - F(a)
$$
`
    insertAtCursor(template)
  }

  const insertCode = () => {
    const template = `
\`\`\`javascript
function example() {
    console.log('Hello, World!');
    return true;
}
\`\`\`
`
    insertAtCursor(template)
  }

  const triggerImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e: any) => handleImageUpload(e)
    input.click()
  }

  const handleImageUpload = (event: any) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result
        const template = `![Image](${imageData})\n`
        insertAtCursor(template)
      }
      reader.readAsDataURL(file)
    })
  }

  const insertHighlight = () => {
    const template = `<span class="highlight-yellow">highlighted text</span>`
    insertAtCursor(template)
  }

  const loadSampleContent = () => {
    const sample = `# **Advanced Research Paper**

## **Abstract**
This document demonstrates the **comprehensive formatting capabilities** of the Converto export tool, including *tables*, mathematical equations, code snippets, and proper formatting.

## **Introduction**
Modern academic writing requires sophisticated formatting tools that can handle various content types while maintaining consistency across different export formats.

---

## 🔵 **Differentiation Prompts**

### **Beginner**
- Differentiate $f(x) = 3x^2 + 5x - 7$  
- Find $\\frac{d}{dx}(\\sin x + x^3)$  
- Find the derivative of $y = e^x + \\ln x$

### **Intermediate**
- Differentiate $f(x) = x^2 e^x$
- Find $\\frac{d}{dx}\\left(\\frac{x^3 + 1}{x - 2}\\right)$
- Find the derivative of $y = \\sin(x^2)$

### **Challenging**
- Differentiate $f(x) = x^x$
- Find $\\frac{d}{dx}(\\ln(\\sin(x^2)))$
- Differentiate $y = -\\frac{2x}{x^3 + x + 1}$

---

# **Mathematical Formulas**

The relationship between energy and mass is expressed as:

$$
E = mc^2
$$

For more complex equations, consider the quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Inline equations work too:  
$$
\\sum_{i=1}^{n} x_i = \\bar{x} \\cdot n
$$

### **Statistical Analysis**
The standard deviation formula is given by:

$$
\\sigma = \\sqrt{\\frac{1}{N} \\sum_{i=1}^{N} (x_i - \\mu)^2}
$$

---

# **Results**

## **Data Summary**

| Experiment   | Sample Size | Mean | Std Dev | p-value |
|--------------|-------------|------|---------|---------|
| Control      | 150         | 45.2 | 3.8     | -       |
| Treatment A  | 148         | 52.7 | 4.2     | 0.001   |
| Treatment B  | 152         | 49.3 | 3.5     | 0.032   |
| Treatment C  | 145         | 58.1 | 5.1     | <0.001  |

---

## **Code Implementation**

### **Python Example**

\`\`\`python
import numpy as np
import pandas as pd
from scipy import stats

def analyze_results(data):
    """
    Perform statistical analysis on experimental data
    """
    
    # Calculate descriptive statistics
    mean = np.mean(data)
    std_dev = np.std(data)
    
    # Perform t-test
    t_stat, p_value = stats.ttest_ind(control, treatment)
    
    return {
        'mean': mean,
        'std_dev': std_dev,
        'p_value': p_value
    }

# Load and process data
df = pd.read_csv('experimental_data.csv')
results = analyze_results(df['values'])
print(f"Mean: {results['mean']:.2f}")
\`\`\`

### **JavaScript Example**

\`\`\`javascript
// Data visualization function
function createChart(data, options) {
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Experiment Results',
                data: data.values,
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2
            }]
        },
        options: options
    });
    return chart;
}
\`\`\`

---

# **Discussion**

## **Important Findings**
> *The results demonstrate a **statistically significant** improvement in the treatment groups compared to the control group. This suggests that the intervention is effective across multiple conditions.*

## **Highlighted Insights**
- 🔴 Treatment C showed the highest efficacy  
- 🟢 All treatments exceeded the minimum threshold  
- 🔵 No adverse effects were reported  
- 🟣 Cost-benefit analysis favors Treatment A  

---

# **Conclusion**
This comprehensive analysis demonstrates the effectiveness of the proposed treatments. The formatting capabilities shown here ensure that complex research can be documented and shared with full fidelity across multiple formats.

## **Future Work**
1. Extend the study to larger sample sizes  
2. Investigate long-term effects  
3. Conduct cost-effectiveness analysis  
4. Explore combination therapies  

---

# **References**
1. Smith, J., & Johnson, A. (2023). *Modern Research Methods*. Academic Press.  
2. Brown, K. et al. (2024). Statistical analysis in experimental design. *Journal of Research*, 45(2), 123-145.

---

**Note:** This document was created using Converto v1.0 - Professional Content Export Tool.

---
`
    setMarkdown(sample)
  }

  return (
    <section className="editor-section">
      <div className="toolbar">
        <button onClick={insertTable} className="btn btn-tool" title="Insert Table">
          <span>📊</span> Table
        </button>
        <button onClick={insertEquation} className="btn btn-tool" title="Insert Math Equation">
          <span>∑</span> Equation
        </button>
        <button onClick={insertCode} className="btn btn-tool" title="Insert Code">
          <span>💻</span> Code
        </button>
        <button onClick={triggerImageUpload} className="btn btn-tool" title="Insert Image">
          <span>🖼️</span> Image
        </button>
        <button onClick={insertHighlight} className="btn btn-tool" title="Add Highlight">
          <span>🖍️</span> Highlight
        </button>
        <button onClick={loadSampleContent} className="btn btn-tool" title="Load Sample Content">
          <span>📄</span> Load Sample
        </button>
      </div>
      
      <div className="editor-container">
        <textarea
          ref={textareaRef}
          id="markdownInput"
          placeholder="Paste your content from ChatGPT, Gemini, Claude or any AI tool here...

💡 Or use the toolbar buttons to insert tables, equations, code blocks, and more!"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
        />
      </div>
    </section>
  )
}
