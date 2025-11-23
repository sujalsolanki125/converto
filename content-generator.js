/**
 * Content Generator Module
 * Handles creation and formatting of various content types
 */

class ContentGenerator {
    constructor() {
        this.content = {
            text: '',
            tables: [],
            equations: [],
            code: [],
            citations: [],
            metadata: {
                title: '',
                author: '',
                date: new Date().toLocaleDateString()
            }
        };
    }

    /**
     * Generate a formatted table
     */
    createTable(headers, rows, caption = '') {
        const table = {
            id: `table-${Date.now()}`,
            headers: headers,
            rows: rows,
            caption: caption
        };
        
        this.content.tables.push(table);
        return this.formatTableHTML(table);
    }

    /**
     * Format table as HTML
     */
    formatTableHTML(table) {
        let html = '<table class="formatted-table">\n';
        
        if (table.caption) {
            html += `  <caption>${table.caption}</caption>\n`;
        }
        
        // Headers
        html += '  <thead>\n    <tr>\n';
        table.headers.forEach(header => {
            html += `      <th>${header}</th>\n`;
        });
        html += '    </tr>\n  </thead>\n';
        
        // Body
        html += '  <tbody>\n';
        table.rows.forEach(row => {
            html += '    <tr>\n';
            row.forEach(cell => {
                html += `      <td>${cell}</td>\n`;
            });
            html += '    </tr>\n';
        });
        html += '  </tbody>\n</table>\n';
        
        return html;
    }

    /**
     * Create a math equation
     */
    createEquation(latex, display = true) {
        const equation = {
            id: `eq-${Date.now()}`,
            latex: latex,
            display: display
        };
        
        this.content.equations.push(equation);
        return this.formatEquationHTML(equation);
    }

    /**
     * Format equation as HTML with KaTeX
     */
    formatEquationHTML(equation) {
        try {
            if (equation.display) {
                return katex.renderToString(equation.latex, {
                    displayMode: true,
                    throwOnError: false
                });
            } else {
                return katex.renderToString(equation.latex, {
                    displayMode: false,
                    throwOnError: false
                });
            }
        } catch (e) {
            console.error('KaTeX rendering error:', e);
            return `<span class="math-error">Error rendering: ${equation.latex}</span>`;
        }
    }

    /**
     * Create a code snippet with syntax highlighting
     */
    createCodeSnippet(code, language = 'javascript', caption = '') {
        const snippet = {
            id: `code-${Date.now()}`,
            code: code,
            language: language,
            caption: caption
        };
        
        this.content.code.push(snippet);
        return this.formatCodeHTML(snippet);
    }

    /**
     * Format code as HTML with syntax highlighting
     */
    formatCodeHTML(snippet) {
        let html = '<div class="code-block">\n';
        
        if (snippet.caption) {
            html += `  <div class="code-caption">${snippet.caption}</div>\n`;
        }
        
        html += `  <pre><code class="language-${snippet.language}">${this.escapeHtml(snippet.code)}</code></pre>\n`;
        html += '</div>\n';
        
        return html;
    }

    /**
     * Create highlighted text with custom background color
     */
    createHighlight(text, color = 'yellow') {
        return `<span class="highlight-${color}">${text}</span>`;
    }

    /**
     * Format text with various styles
     */
    formatText(text, style) {
        const styles = {
            bold: `<strong>${text}</strong>`,
            italic: `<em>${text}</em>`,
            underline: `<u>${text}</u>`,
            strikethrough: `<s>${text}</s>`,
            superscript: `<sup>${text}</sup>`,
            subscript: `<sub>${text}</sub>`,
            code: `<code>${text}</code>`
        };
        
        return styles[style] || text;
    }

    /**
     * Create a formatted list
     */
    createList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        let html = `<${tag}>\n`;
        
        items.forEach(item => {
            html += `  <li>${item}</li>\n`;
        });
        
        html += `</${tag}>\n`;
        return html;
    }

    /**
     * Create a blockquote
     */
    createBlockquote(text, citation = '') {
        let html = '<blockquote>\n';
        html += `  <p>${text}</p>\n`;
        
        if (citation) {
            html += `  <cite>— ${citation}</cite>\n`;
        }
        
        html += '</blockquote>\n';
        return html;
    }

    /**
     * Generate sample content for demonstration
     */
    generateSampleContent() {
        return `# Advanced Research Paper

## Abstract
This document demonstrates the **comprehensive formatting capabilities** of the Converto export tool, including *tables*, mathematical equations, code snippets, and proper formatting.

## Introduction
Modern academic writing requires sophisticated formatting tools that can handle various content types while maintaining consistency across different export formats.

---

## 🔵 Differentiation Prompts

**Beginner**

* Differentiate $f(x) = 3x^2 + 5x - 7$
* Find $\\frac{d}{dx}(\\sin x + x^3)$
* Find the derivative of $y = e^x + \\ln x$

**Intermediate**

* Differentiate $f(x) = x^2 e^x$
* Find $\\frac{d}{dx}\\left(\\frac{x^3 + 1}{x - 2}\\right)$
* Find the derivative of $y = \\sin(x^2)$

**Challenging**

* Differentiate $f(x) = x^x$
* Find $\\frac{d}{dx}(\\ln(\\sin x^2))$
* Differentiate $y = \\frac{2x}{x^3\\sqrt{x+1}}$

---

## Mathematical Formulas

The relationship between energy and mass is expressed as:

$$
E = mc^2
$$

For more complex equations, consider the quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Inline equations work too: $\\sum_{i=1}^{n} x_i = \\bar{x} \\cdot n$

### Statistical Analysis
The standard deviation formula is given by:

$$
\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^{N}(x_i - \\mu)^2}
$$

## Results

### Data Summary
| Experiment | Sample Size | Mean | Std Dev | p-value |
|------------|-------------|------|---------|---------|
| Control    | 150         | 45.2 | 3.8     | -       |
| Treatment A| 148         | 52.7 | 4.2     | 0.001   |
| Treatment B| 152         | 49.3 | 3.5     | 0.032   |
| Treatment C| 145         | 58.1 | 5.1     | <0.001  |

### Code Implementation
Here's the Python implementation of our analysis:

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

### JavaScript Example
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

## Discussion

### Important Findings
> The results demonstrate a **statistically significant** improvement in the treatment groups compared to the control group. This suggests that the intervention is effective across multiple conditions.

### Highlighted Insights
- 🔴 <span class="highlight-yellow">Treatment C showed the highest efficacy</span>
- 🟢 <span class="highlight-green">All treatments exceeded the minimum threshold</span>
- 🔵 <span class="highlight-blue">No adverse effects were reported</span>
- 🟣 <span class="highlight-pink">Cost-benefit analysis favors Treatment A</span>

## Conclusion
This comprehensive analysis demonstrates the effectiveness of the proposed treatments. The formatting capabilities shown here ensure that complex research can be documented and shared with full fidelity across multiple formats.

### Future Work
1. Extend the study to larger sample sizes
2. Investigate long-term effects
3. Conduct cost-effectiveness analysis
4. Explore combination therapies

## References
1. Smith, J., & Johnson, A. (2023). *Modern Research Methods*. Academic Press.
2. Brown, K. et al. (2024). Statistical analysis in experimental design. *Journal of Research*, 45(2), 123-145.

---

**Note**: This document was created using BibCit v1.0 - Professional Content Export Tool
`;
    }

    /**
     * Escape HTML special characters
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Add metadata to content
     */
    setMetadata(title, author, date) {
        this.content.metadata = {
            title: title || this.content.metadata.title,
            author: author || this.content.metadata.author,
            date: date || this.content.metadata.date
        };
    }

    /**
     * Get all content as structured object
     */
    getContent() {
        return this.content;
    }

    /**
     * Clear all content
     */
    clearContent() {
        this.content = {
            text: '',
            tables: [],
            equations: [],
            code: [],
            citations: [],
            metadata: {
                title: '',
                author: '',
                date: new Date().toLocaleDateString()
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentGenerator;
}
