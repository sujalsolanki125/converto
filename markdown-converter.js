/**
 * Markdown to HTML Converter
 * Advanced markdown parsing with support for tables, math, and code
 */

class MarkdownConverter {
    constructor() {
        // Configure marked options
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: true,
                mangle: false,
                sanitize: false,
                smartLists: true,
                smartypants: true,
                xhtml: true,
                highlight: function(code, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (e) {
                            console.error('Highlight error:', e);
                        }
                    }
                    return hljs.highlightAuto(code).value;
                }
            });
        }
    }

    /**
     * Convert markdown to HTML
     */
    convert(markdown) {
        if (!markdown) return '';

        try {
            // Pre-process math equations
            markdown = this.preprocessMath(markdown);

            // Convert markdown to HTML using marked
            let html = marked.parse(markdown);

            // Post-process the HTML
            html = this.postprocessHTML(html);

            return html;
        } catch (error) {
            console.error('Markdown conversion error:', error);
            return `<p class="error">Error converting markdown: ${error.message}</p>`;
        }
    }

    /**
     * Pre-process LaTeX math equations
     */
    preprocessMath(markdown) {
        // Store math equations
        const displayMaths = [];
        const inlineMaths = [];
        
        // Handle different LaTeX formats from AI tools:
        // 1. $$...$$ (standard display math)
        // 2. \[...\] (LaTeX display math)
        // 3. \(...\) (LaTeX inline math)
        // 4. $...$ (inline math)
        // 5. ( \math ) (ChatGPT inline with backslash - space sensitive)
        
        // First, convert LaTeX-style \[...\] to $$...$$
        markdown = markdown.replace(/\\\[([\s\S]*?)\\\]/g, (match, equation) => {
            return `$$${equation}$$`;
        });
        
        // Convert LaTeX-style \(...\) to $...$
        markdown = markdown.replace(/\\\((.*?)\\\)/g, (match, equation) => {
            return `$${equation}$`;
        });
        
        // Convert ChatGPT-style ( \command... ) to $...$
        // Must start with ( followed by space and backslash
        markdown = markdown.replace(/\(\s+(\\[a-zA-Z]+[^)]*?)\s+\)/g, (match, equation) => {
            return `$${equation.trim()}$`;
        });
        
        // Now process display math ($$...$$) - handle multi-line
        markdown = markdown.replace(/\$\$([\s\S]*?)\$\$/g, (match, equation) => {
            displayMaths.push(equation.trim());
            return `\n%%%DISPLAY_MATH_${displayMaths.length - 1}%%%\n`;
        });

        // Then protect inline math ($...$) - avoid matching across lines
        markdown = markdown.replace(/\$([^\$\n]+?)\$/g, (match, equation) => {
            inlineMaths.push(equation.trim());
            return `%%%INLINE_MATH_${inlineMaths.length - 1}%%%`;
        });

        // Store for post-processing
        this._displayMaths = displayMaths;
        this._inlineMaths = inlineMaths;

        return markdown;
    }

    /**
     * Post-process HTML to render math
     */
    postprocessHTML(html) {
        // Render display math
        if (this._displayMaths && this._displayMaths.length > 0) {
            this._displayMaths.forEach((equation, index) => {
                const placeholder = `%%%DISPLAY_MATH_${index}%%%`;
                // Handle both <p> wrapped and standalone placeholders
                const patterns = [
                    `<p>${placeholder}</p>`,
                    placeholder
                ];
                
                try {
                    // Clean the equation - remove extra whitespace but preserve structure
                    let cleanEquation = equation.trim();
                    
                    // Log for debugging
                    console.log('Rendering display math:', cleanEquation);
                    
                    const rendered = katex.renderToString(cleanEquation, {
                        displayMode: true,
                        throwOnError: false,
                        trust: true,
                        strict: false,
                        macros: {
                            "\\RR": "\\mathbb{R}",
                            "\\NN": "\\mathbb{N}",
                            "\\ZZ": "\\mathbb{Z}",
                            "\\QQ": "\\mathbb{Q}"
                        }
                    });
                    const wrappedRendered = `<div class="katex-display-wrapper">${rendered}</div>`;
                    
                    // Replace all patterns
                    patterns.forEach(pattern => {
                        html = html.split(pattern).join(wrappedRendered);
                    });
                } catch (e) {
                    console.error('Display math error:', e.message, '\nEquation:', equation);
                    const errorMsg = `<div class="math-error">LaTeX Error: ${e.message}<br><code>${this.escapeHtml(equation)}</code></div>`;
                    patterns.forEach(pattern => {
                        html = html.split(pattern).join(errorMsg);
                    });
                }
            });
        }

        // Render inline math
        if (this._inlineMaths && this._inlineMaths.length > 0) {
            this._inlineMaths.forEach((equation, index) => {
                const placeholder = `%%%INLINE_MATH_${index}%%%`;
                try {
                    // Clean the equation
                    let cleanEquation = equation.trim();
                    
                    // Log for debugging
                    console.log('Rendering inline math:', cleanEquation);
                    
                    const rendered = katex.renderToString(cleanEquation, {
                        displayMode: false,
                        throwOnError: false,
                        trust: true,
                        strict: false,
                        macros: {
                            "\\RR": "\\mathbb{R}",
                            "\\NN": "\\mathbb{N}",
                            "\\ZZ": "\\mathbb{Z}",
                            "\\QQ": "\\mathbb{Q}"
                        }
                    });
                    html = html.split(placeholder).join(rendered);
                } catch (e) {
                    console.error('Inline math error:', e.message, '\nEquation:', equation);
                    html = html.split(placeholder).join(`<span class="math-error" title="${e.message}">$${this.escapeHtml(equation)}$</span>`);
                }
            });
        }

        // Add custom classes to elements
        html = this.addCustomClasses(html);

        return html;
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
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Add custom CSS classes to HTML elements
     */
    addCustomClasses(html) {
        // Add classes to tables
        html = html.replace(/<table>/g, '<table class="formatted-table">');
        
        // Add classes to code blocks
        html = html.replace(/<pre>/g, '<pre class="code-block">');
        
        // Add classes to blockquotes
        html = html.replace(/<blockquote>/g, '<blockquote class="styled-quote">');

        return html;
    }

    /**
     * Convert HTML back to markdown (for editing)
     */
    htmlToMarkdown(html) {
        // Basic HTML to Markdown conversion
        let markdown = html;

        // Headers
        markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
        markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
        markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
        markdown = markdown.replace(/<h4>(.*?)<\/h4>/g, '#### $1\n');

        // Bold and italic
        markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
        markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
        markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
        markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');

        // Code
        markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');

        // Links
        markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

        // Lists
        markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');

        // Paragraphs
        markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');

        // Remove remaining HTML tags
        markdown = markdown.replace(/<[^>]*>/g, '');

        // Decode HTML entities
        markdown = this.decodeHtmlEntities(markdown);

        return markdown.trim();
    }

    /**
     * Decode HTML entities
     */
    decodeHtmlEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    /**
     * Extract plain text from markdown
     */
    toPlainText(markdown) {
        // Remove markdown syntax
        let text = markdown;

        // Remove headers
        text = text.replace(/^#{1,6}\s+/gm, '');

        // Remove emphasis
        text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
        text = text.replace(/(\*|_)(.*?)\1/g, '$2');

        // Remove links but keep text
        text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

        // Remove images
        text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');

        // Remove code blocks
        text = text.replace(/```[\s\S]*?```/g, '');
        text = text.replace(/`([^`]+)`/g, '$1');

        // Remove horizontal rules
        text = text.replace(/^(-{3,}|_{3,}|\*{3,})$/gm, '');

        // Remove blockquotes
        text = text.replace(/^>\s+/gm, '');

        return text.trim();
    }

    /**
     * Generate table of contents from markdown
     */
    generateTOC(markdown) {
        const headerRegex = /^(#{1,6})\s+(.+)$/gm;
        const toc = [];
        let match;

        while ((match = headerRegex.exec(markdown)) !== null) {
            const level = match[1].length;
            const title = match[2].trim();
            const id = title.toLowerCase().replace(/[^\w]+/g, '-');

            toc.push({
                level: level,
                title: title,
                id: id
            });
        }

        return toc;
    }

    /**
     * Generate TOC HTML
     */
    generateTOCHTML(markdown) {
        const toc = this.generateTOC(markdown);
        let html = '<div class="table-of-contents">\n';
        html += '<h2>Table of Contents</h2>\n<ul>\n';

        toc.forEach(item => {
            const indent = '  '.repeat(item.level - 1);
            html += `${indent}<li><a href="#${item.id}">${item.title}</a></li>\n`;
        });

        html += '</ul>\n</div>\n';
        return html;
    }

    /**
     * Apply syntax highlighting to code blocks
     */
    highlightCode(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const codeBlocks = tempDiv.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
        });

        return tempDiv.innerHTML;
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(html) {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = html;
        return tempDiv.innerHTML;
    }

    /**
     * Get word count from markdown
     */
    getWordCount(markdown) {
        const plainText = this.toPlainText(markdown);
        const words = plainText.split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    /**
     * Get reading time estimate
     */
    getReadingTime(markdown) {
        const wordCount = this.getWordCount(markdown);
        const wordsPerMinute = 200;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes;
    }

    /**
     * Export statistics
     */
    getStatistics(markdown) {
        return {
            wordCount: this.getWordCount(markdown),
            readingTime: this.getReadingTime(markdown),
            characterCount: markdown.length,
            paragraphCount: markdown.split(/\n\n+/).length,
            headingCount: (markdown.match(/^#{1,6}\s+/gm) || []).length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarkdownConverter;
}
