/**
 * Main Application Script
 * Handles UI interactions and coordinates all modules
 */

// Declare module variables
let contentGen;
let markdownConv;
let exportHandler;

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Converto - DOM Ready');
    
    // Wait for all external libraries to load
    const initializeApp = () => {
        // Check if all required libraries are loaded
        if (typeof marked === 'undefined') {
            console.log('Waiting for marked library...');
            setTimeout(initializeApp, 100);
            return;
        }
        if (typeof hljs === 'undefined') {
            console.log('Waiting for highlight.js library...');
            setTimeout(initializeApp, 100);
            return;
        }
        if (typeof katex === 'undefined') {
            console.log('Waiting for KaTeX library...');
            setTimeout(initializeApp, 100);
            return;
        }
        if (typeof JSZip === 'undefined') {
            console.log('Waiting for JSZip library...');
            setTimeout(initializeApp, 100);
            return;
        }
        if (typeof html2pdf === 'undefined') {
            console.log('Waiting for html2pdf library...');
            setTimeout(initializeApp, 100);
            return;
        }
        if (typeof saveAs === 'undefined') {
            console.log('Waiting for FileSaver library...');
            setTimeout(initializeApp, 100);
            return;
        }
        
        console.log('All libraries loaded, initializing modules...');
        
        // Initialize modules after all dependencies are ready
        try {
            contentGen = new ContentGenerator();
            console.log('✓ ContentGenerator initialized');
            
            markdownConv = new MarkdownConverter();
            console.log('✓ MarkdownConverter initialized');
            
            exportHandler = new ExportHandler();
            console.log('✓ ExportHandler initialized');
            
            console.log('✅ All modules initialized successfully');
            
            // Set up event listeners after successful initialization
            setupEventListeners();
            
            // Show welcome message on startup
            showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Error initializing modules:', error);
            alert('Error loading application: ' + error.message + '. Please refresh the page.');
            return;
        }
    };
    
    // Start initialization
    initializeApp();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Set up auto-preview on input
    const input = document.getElementById('markdownInput');
    if (input) {
        input.addEventListener('input', debounce(updatePreview, 500));
    }

    // Set up paste event listener for images in textarea
    if (input) {
        input.addEventListener('paste', handlePasteImage);
    }
    
    // Set up paste event listener for images in preview (when edit mode is on)
    const preview = document.getElementById('preview');
    if (preview) {
        preview.addEventListener('paste', handlePasteInPreview);
    }
}

/**
 * Show welcome message
 */
function showWelcomeMessage() {
    const preview = document.getElementById('preview');
    preview.innerHTML = `
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
                <p style="font-size: 14px; color: rgba(255, 255, 255, 0.6); margin-bottom: 16px; letter-spacing: 0.01em;">Get started by pasting your content or</p>
                <button onclick="loadSampleContent()" style="background: linear-gradient(135deg, rgba(102, 228, 255, 0.2), rgba(217, 70, 239, 0.2)); color: white; border: 1px solid rgba(102, 228, 255, 0.3); padding: 14px 28px; border-radius: 16px; font-size: 14px; font-weight: 500; cursor: pointer; backdrop-filter: blur(10px); box-shadow: 0 4px 15px rgba(102, 228, 255, 0.2); transition: all 0.3s ease;" onmouseover="this.style.background='linear-gradient(135deg, rgba(102, 228, 255, 0.3), rgba(217, 70, 239, 0.3))'; this.style.boxShadow='0 6px 20px rgba(102, 228, 255, 0.3)'; this.style.transform='translateY(-2px)';" onmouseout="this.style.background='linear-gradient(135deg, rgba(102, 228, 255, 0.2), rgba(217, 70, 239, 0.2))'; this.style.boxShadow='0 4px 15px rgba(102, 228, 255, 0.2)'; this.style.transform='translateY(0)';">View Sample Content</button>
            </div>
        </div>
    `;
}

/**
 * Update preview with current markdown
 */
function updatePreview() {
    const markdown = document.getElementById('markdownInput').value;
    const preview = document.getElementById('preview');
    
    if (!markdown.trim()) {
        preview.innerHTML = '<p class="placeholder">Your formatted content will appear here...</p>';
        return;
    }

    try {
        const html = markdownConv.convert(markdown);
        preview.innerHTML = html;

        // Apply syntax highlighting
        preview.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Note: Math is already rendered by the markdown converter
        // No need for additional renderMathInElement call

        // Update content statistics
        updateContentStats(markdown, preview);

    } catch (error) {
        preview.innerHTML = `<p class="error">Error rendering preview: ${error.message}</p>`;
        console.error('Preview error:', error);
    }
}

/**
 * Load sample content
 */
function loadSampleContent() {
    const textarea = document.getElementById('markdownInput');
    const sampleContent = contentGen.generateSampleContent();
    textarea.value = sampleContent;
    updatePreview();
}

/**
 * Insert a table template
 */
function insertTable() {
    const template = `
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |
| Row 2 Col 1 | Row 2 Col 2 | Row 2 Col 3 |
`;
    insertAtCursor(template);
    updatePreview();
}

/**
 * Insert an equation template
 */
function insertEquation() {
    const template = `
$$
\\int_{a}^{b} f(x) dx = F(b) - F(a)
$$
`;
    insertAtCursor(template);
    updatePreview();
}

/**
 * Insert a code template
 */
function insertCode() {
    const template = `
\`\`\`javascript
function example() {
    console.log('Hello, World!');
    return true;
}
\`\`\`
`;
    insertAtCursor(template);
    updatePreview();
}

/**
 * Insert highlight template
 */
function insertHighlight() {
    const template = `<span class="highlight-yellow">highlighted text</span>`;
    insertAtCursor(template);
    updatePreview();
}

/**
 * Insert text at cursor position
 */
function insertAtCursor(text) {
    const textarea = document.getElementById('markdownInput');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    
    textarea.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
}

/**
 * Export to HTML
 */
async function exportToHTML() {
    if (!exportHandler) {
        alert('Application is still loading. Please wait a moment.');
        return;
    }
    
    const markdown = document.getElementById('markdownInput').value;
    
    if (!markdown.trim()) {
        alert('Please enter some content first');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '⏳ Exporting...';

    try {
        // Get theme selection
        const theme = document.querySelector('input[name="exportTheme"]:checked').value;
        
        const options = {
            includeStyles: document.getElementById('includeStyles').checked,
            includeTOC: document.getElementById('includeTOC').checked,
            title: 'Document',
            author: 'Converto User',
            date: new Date().toLocaleDateString(),
            theme: theme
        };

        const result = await exportHandler.exportToHTML(markdown, options);
        
        if (result.success) {
            showNotification('HTML exported successfully!', 'success');
        } else {
            showNotification('Export failed: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Export error: ' + error.message, 'error');
        console.error('Export error:', error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🌐 Export to HTML';
    }
}

/**
 * Export to DOCX
 */
async function exportToDOCX() {
    if (!exportHandler) {
        alert('Application is still loading. Please wait a moment.');
        return;
    }
    
    const markdown = document.getElementById('markdownInput').value;
    
    if (!markdown.trim()) {
        alert('Please enter some content first');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '⏳ Exporting...';

    try {
        // Get theme selection
        const theme = document.querySelector('input[name="exportTheme"]:checked').value;
        
        const options = {
            title: 'Document',
            author: 'Converto User',
            date: new Date().toLocaleDateString(),
            includeTOC: document.getElementById('includeTOC').checked,
            pageNumbers: document.getElementById('pageNumbers').checked,
            theme: theme
        };

        const result = await exportHandler.exportToDOCX(markdown, options);
        
        if (result.success) {
            showNotification('DOCX exported successfully!', 'success');
        } else {
            showNotification('Export failed: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Export error: ' + error.message, 'error');
        console.error('Export error:', error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '📄 Export to DOCX';
    }
}

/**
 * Export to PDF
 */
async function exportToPDF() {
    if (!exportHandler) {
        alert('Application is still loading. Please wait a moment.');
        return;
    }
    
    const markdown = document.getElementById('markdownInput').value;
    
    if (!markdown.trim()) {
        alert('Please enter some content first');
        return;
    }

    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Preparing export...';

    const updateStatus = (message) => {
        if (btn.disabled) {
            btn.innerHTML = message;
        }
    };

    try {
        // Get theme selection
        const theme = document.querySelector('input[name="exportTheme"]:checked').value;
        
        const options = {
            title: 'Document',
            author: 'Converto User',
            date: new Date().toLocaleDateString(),
            includeTOC: document.getElementById('includeTOC').checked,
            includeStyles: document.getElementById('includeStyles').checked,
            theme: theme
        };

        const result = await exportHandler.exportToPDF(markdown, options, updateStatus);
        
        if (result.success) {
            btn.innerHTML = '✅ PDF Downloaded!';
            showNotification('PDF exported successfully!', 'success');
        } else {
            btn.innerHTML = '❌ Export Failed';
            showNotification('Export failed: ' + result.error, 'error');
        }
    } catch (error) {
        btn.innerHTML = '❌ Export Failed';
        showNotification('Export error: ' + error.message, 'error');
        console.error('Export error:', error);
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }, 2000);
    }
}

/**
 * Copy formatted content to clipboard
 */
async function copyFormattedContent() {
    if (!exportHandler) {
        alert('Application is still loading. Please wait a moment.');
        return;
    }
    
    const markdown = document.getElementById('markdownInput').value;
    
    if (!markdown.trim()) {
        alert('Please enter some content first');
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '⏳ Copying...';

    try {
        const result = await exportHandler.copyFormattedContent(markdown);
        
        if (result.success) {
            showNotification(result.message, 'success');
        } else {
            showNotification('Copy failed: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('Copy error: ' + error.message, 'error');
        console.error('Copy error:', error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '📋 Copy Formatted';
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Debounce function to limit function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('BibCit application loaded successfully');

/**
 * Toggle How to Use section
 */
function toggleHowToUse() {
    const section = document.getElementById('howToUseSection');
    section.classList.toggle('hidden');
    
    // Smooth scroll to footer if showing
    if (!section.classList.contains('hidden')) {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Toggle theme between light and dark mode
 */
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    
    body.classList.toggle('dark-mode');
    
    // Update icon with animation
    if (body.classList.contains('dark-mode')) {
        themeIcon.textContent = '☀️'; // Sun icon for dark mode (shows what clicking will do)
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙'; // Moon icon for light mode (shows what clicking will do)
        localStorage.setItem('theme', 'light');
    }
    
    // Add rotation animation
    themeIcon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        themeIcon.style.transform = 'rotate(0deg)';
    }, 300);
}

/**
 * Load saved theme on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
});

/**
 * Update content statistics
 */
function updateContentStats(markdown, previewElement) {
    const statsContainer = document.getElementById('contentStats');
    
    if (!markdown || markdown.trim().length === 0) {
        statsContainer.classList.add('hidden');
        return;
    }
    
    // Show stats container
    statsContainer.classList.remove('hidden');
    
    // Get text content from preview (removes HTML tags)
    const textContent = previewElement.textContent || '';
    
    // Word count (split by whitespace, filter empty strings)
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Character count (excluding whitespace)
    const charCount = textContent.replace(/\s/g, '').length;
    
    // Paragraph count (count <p> tags in preview)
    const paragraphs = previewElement.querySelectorAll('p');
    const paraCount = paragraphs.length;
    
    // Heading count (count all h1-h6 tags)
    const headings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingCount = headings.length;
    
    // Reading time (average 200 words per minute)
    const readTime = Math.ceil(wordCount / 200);
    
    // Update UI
    document.getElementById('wordCount').textContent = wordCount.toLocaleString();
    document.getElementById('charCount').textContent = charCount.toLocaleString();
    document.getElementById('paraCount').textContent = paraCount;
    document.getElementById('headingCount').textContent = headingCount;
    document.getElementById('readTime').textContent = readTime;
}

/**
 * Rich Text Editing Functions for Live Preview
 */

let isEditMode = false;
let editHistory = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

/**
 * Toggle edit mode for preview
 */
function toggleEditMode() {
    const preview = document.getElementById('preview');
    const editToolbar = document.getElementById('editToolbar');
    const editModeBtn = document.getElementById('editModeBtn');
    
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        // Enable editing
        preview.contentEditable = true;
        preview.style.outline = '2px solid rgba(102, 228, 255, 0.3)';
        preview.style.outlineOffset = '4px';
        editToolbar.classList.remove('hidden');
        editModeBtn.innerHTML = '🔒 Disable Editing';
        editModeBtn.classList.add('btn-danger');
        
        // Save initial state
        saveHistory();
        
        // Add edit listeners
        preview.addEventListener('input', handlePreviewInput);
    } else {
        // Disable editing
        preview.contentEditable = false;
        preview.style.outline = 'none';
        editToolbar.classList.add('hidden');
        editModeBtn.innerHTML = '✏️ Enable Editing';
        editModeBtn.classList.remove('btn-danger');
        
        // Remove edit listeners
        preview.removeEventListener('input', handlePreviewInput);
    }
}

/**
 * Handle preview input for history tracking
 */
function handlePreviewInput() {
    saveHistory();
}

/**
 * Save current state to history
 */
function saveHistory() {
    const preview = document.getElementById('preview');
    
    // Remove any future history if we're not at the end
    if (historyIndex < editHistory.length - 1) {
        editHistory = editHistory.slice(0, historyIndex + 1);
    }
    
    // Add current state
    editHistory.push(preview.innerHTML);
    
    // Limit history size
    if (editHistory.length > MAX_HISTORY) {
        editHistory.shift();
    } else {
        historyIndex++;
    }
}

/**
 * Format selected text
 */
function formatText(command) {
    if (!isEditMode) return;
    
    const preview = document.getElementById('preview');
    preview.focus();
    
    try {
        document.execCommand(command, false, null);
        saveHistory();
    } catch (error) {
        console.error('Format command failed:', error);
    }
}

/**
 * Delete selected text
 */
function deleteSelectedText() {
    if (!isEditMode) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (!range.collapsed) {
        range.deleteContents();
        saveHistory();
    }
}

/**
 * Undo edit
 */
function undoEdit() {
    if (!isEditMode || historyIndex <= 0) return;
    
    historyIndex--;
    const preview = document.getElementById('preview');
    preview.innerHTML = editHistory[historyIndex];
}

/**
 * Redo edit
 */
function redoEdit() {
    if (!isEditMode || historyIndex >= editHistory.length - 1) return;
    
    historyIndex++;
    const preview = document.getElementById('preview');
    preview.innerHTML = editHistory[historyIndex];
}

/**
 * Image Handling Functions
 */

/**
 * Trigger file input for image upload
 */
function triggerImageUpload() {
    document.getElementById('imageUpload').click();
}

/**
 * Handle image file upload
 */
function handleImageUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            processImageFile(file);
        } else {
            alert('Please select valid image files (PNG, JPG, GIF, SVG, WebP)');
        }
    });
    
    // Reset input so same file can be selected again
    event.target.value = '';
}

/**
 * Process image file and convert to base64
 */
function processImageFile(file, insertAtCursor = true) {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('Image is too large. Please use images smaller than 10MB.');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        // Auto-resize if image is too large
        const img = new Image();
        img.onload = function() {
            const maxWidth = 800;
            const maxHeight = 600;
            
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions if needed
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
                
                // Create canvas to resize
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get resized base64
                const resizedBase64 = canvas.toDataURL(file.type || 'image/png', 0.9);
                insertImageToEditor(resizedBase64, file.name, width, height, insertAtCursor);
            } else {
                insertImageToEditor(base64Data, file.name, width, height, insertAtCursor);
            }
        };
        
        img.src = base64Data;
    };
    
    reader.onerror = function() {
        alert('Error reading image file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Insert image markdown into editor
 */
function insertImageToEditor(base64Data, fileName, width, height, insertAtCursor = true) {
    const input = document.getElementById('markdownInput');
    const imageMarkdown = `![${fileName || 'Image'}](${base64Data})\n\n`;
    
    if (insertAtCursor) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const text = input.value;
        
        input.value = text.substring(0, start) + imageMarkdown + text.substring(end);
        input.selectionStart = input.selectionEnd = start + imageMarkdown.length;
    } else {
        input.value += imageMarkdown;
    }
    
    // Trigger preview update
    input.focus();
    updatePreview();
}

/**
 * Handle paste event for images in textarea
 */
function handlePasteImage(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    
    for (let item of items) {
        if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
                processImageFile(file, true);
            }
        }
    }
}

/**
 * Handle paste event for images in preview (edit mode)
 */
function handlePasteInPreview(event) {
    if (!isEditMode) return;
    
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    
    for (let item of items) {
        if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
                insertImageDirectlyToPreview(file);
            }
        }
    }
}

/**
 * Insert image directly into preview in edit mode
 */
function insertImageDirectlyToPreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        // Auto-resize if needed
        const img = new Image();
        img.onload = function() {
            const maxWidth = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = Math.floor(height * ratio);
            }
            
            // Create img element
            const imgElement = document.createElement('img');
            imgElement.src = base64Data;
            imgElement.style.maxWidth = '100%';
            imgElement.style.height = 'auto';
            imgElement.style.margin = '10px 0';
            imgElement.style.borderRadius = '8px';
            imgElement.style.border = '1px solid rgba(102, 228, 255, 0.2)';
            
            // Insert at cursor position in preview
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(imgElement);
                
                // Move cursor after image
                range.setStartAfter(imgElement);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // If no selection, append to preview
                document.getElementById('preview').appendChild(imgElement);
            }
            
            saveHistory();
        };
        
        img.src = base64Data;
    };
    
    reader.readAsDataURL(file);
}
