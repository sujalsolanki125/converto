import JSZip from 'jszip';
import { JSDOM } from 'jsdom';
import katex from 'katex';

interface DocxOptions {
  content: string;
  title?: string;
  author?: string;
  date?: string;
  theme?: 'color' | 'bw';
}

// Global tracking for math equation images
let mathImageCounter = 0;
const mathImages: Array<{ id: string; svg: string }> = [];

export async function generateDocx(options: DocxOptions): Promise<ArrayBuffer> {
  const {
    content,
    title = 'Document',
    author = 'Converto',
    date = new Date().toLocaleDateString(),
    theme = 'color'
  } = options;

  // Reset image tracking for each document
  mathImageCounter = 0;
  mathImages.length = 0;

  // Parse HTML content
  const dom = new JSDOM(content);
  const doc = dom.window.document;

  // Build Word XML document
  const docXml = createDocxXml(title, author, date, doc.body.innerHTML, theme);

  // Create ZIP structure for DOCX
  const zip = new JSZip();

  // Add required DOCX files
  zip.file('[Content_Types].xml', getDocxContentTypes(mathImages.length));
  zip.file('_rels/.rels', getDocxRels());
  zip.file('docProps/app.xml', getDocxAppProps());
  zip.file('docProps/core.xml', getDocxCoreProps(title, author));
  zip.file('word/_rels/document.xml.rels', getDocxDocumentRels(mathImages.length));
  zip.file('word/document.xml', docXml);
  zip.file('word/styles.xml', getDocxStyles(theme));
  zip.file('word/fontTable.xml', getDocxFontTable());
  zip.file('word/settings.xml', getDocxSettings());

  // Add math equation images
  mathImages.forEach((img, index) => {
    zip.file(`word/media/math${index + 1}.svg`, img.svg);
  });

  // Generate DOCX buffer
  // Use STORE (no compression) for better compatibility with Microsoft Word
  const buffer = await zip.generateAsync({
    type: 'arraybuffer',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'STORE',
    compressionOptions: {
      level: 0
    }
  });

  return buffer;
}

/**
 * Create Word XML document
 */
function createDocxXml(title: string, author: string, date: string, bodyHTML: string, theme: string): string {
  const dom = new JSDOM(bodyHTML);
  const doc = dom.window.document;

  let wordXml = '';

  // Process body content - Ensure EVERYTHING is wrapped in a <w:p>
  const processNode = (node: any): string => {
    if (!node) return '';

    // FIX 1: Wrap root text nodes in <w:p>
    if (node.nodeType === 3) { // Text node
      const text = node.textContent || '';
      if (text.trim()) {
        return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
      }
      return '';
    }

    if (node.nodeType === 1) { // Element node
      const tagName = node.tagName?.toLowerCase();
      
      switch (tagName) {
        // Headers
        case 'h1': return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>${processChildren(node)}</w:p>`;
        case 'h2': return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>${processChildren(node)}</w:p>`;
        case 'h3': return `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr>${processChildren(node)}</w:p>`;
        case 'h4': return `<w:p><w:pPr><w:pStyle w:val="Heading4"/></w:pPr>${processChildren(node)}</w:p>`;
        
        // Block Elements
        case 'p': return `<w:p>${processChildren(node)}</w:p>`;
        case 'blockquote': return `<w:p><w:pPr><w:pStyle w:val="Quote"/></w:pPr>${processChildren(node)}</w:p>`;
        
        // Lists
        case 'ul': return processListItems(node, false);
        case 'ol': return processListItems(node, true);
        
        // Tables
        case 'table': return processTable(node);
        
        // Code Blocks
        case 'pre': {
          const codeText = node.textContent || '';
          const lines = codeText.split('\n');
          let result = '';
          lines.forEach((line: string) => {
            const textContent = line ? `<w:t xml:space="preserve">${escapeXml(line)}</w:t>` : '<w:t/>';
            result += `<w:p><w:pPr><w:pStyle w:val="CodeBlock"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/></w:rPr>${textContent}</w:r></w:p>`;
          });
          return result;
        }

        // Display Math (KaTeX specific divs)
        case 'div': {
          if (node.className.includes('katex-display')) {
             // Try to get LaTeX from data attribute first (best fidelity)
             let latex = node.getAttribute('data-latex');
             
             // Fallback to annotation if data attribute missing
             if (!latex) {
               const annotation = node.querySelector('annotation[encoding="application/x-tex"]');
               if (annotation) latex = annotation.textContent;
             }

             if (latex) {
                // Render as embedded SVG image
                return `<w:p>${convertLatexToImageXml(latex, true)}</w:p>`;
             }
          }
          // For non-math divs, process children and wrap if they have content
          const children = processChildren(node);
          return children ? `<w:p>${children}</w:p>` : '';
        }

        case 'br':
          return '<w:p/>'; // Empty paragraph for line break at root

        // FIX 3: Default handler must wrap content in <w:p> to avoid root-level runs
        default: {
          const children = processChildren(node);
          return children ? `<w:p>${children}</w:p>` : '';
        }
      }
    }
    return '';
  };

  Array.from(doc.body.childNodes).forEach((node: any) => {
    wordXml += processNode(node);
  });

  // Theme-aware date color
  const dateColor = theme === 'bw' ? '000000' : '808080';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml">
    <w:body>
        <w:p>
            <w:pPr><w:pStyle w:val="Title"/></w:pPr>
            <w:r><w:t>${escapeXml(title)}</w:t></w:r>
        </w:p>
        ${author ? `<w:p>
            <w:pPr><w:pStyle w:val="Subtitle"/></w:pPr>
            <w:r><w:rPr><w:i/></w:rPr><w:t>By ${escapeXml(author)}</w:t></w:r>
        </w:p>` : ''}
        <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r><w:rPr><w:sz w:val="20"/><w:color w:val="${dateColor}"/></w:rPr><w:t>${escapeXml(date)}</w:t></w:r>
        </w:p>
        ${wordXml}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
            <w:cols w:space="720"/>
        </w:sectPr>
    </w:body>
</w:document>`;
}

/**
 * Process child nodes
 */
function processChildren(node: any): string {
  let result = '';
  Array.from(node.childNodes).forEach((child: any) => {
    if (child.nodeType === 3) { // Text node
      const text = child.textContent;
      if (text) {
        result += `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      }
    } else if (child.nodeType === 1) { // Element node
      const tagName = child.tagName.toLowerCase();
      const text = child.textContent;
      
      if (tagName === 'strong' || tagName === 'b') {
        result += `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      } else if (tagName === 'em' || tagName === 'i') {
        result += `<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      } else if (tagName === 'code') {
        result += `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:shd w:fill="F2F2F2"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      } else if (tagName === 'a') {
        result += `<w:r><w:rPr><w:color w:val="0000FF"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      } else if (tagName === 'br') {
        result += `<w:r><w:br/></w:r>`;
      } else if (tagName === 'span' || tagName === 'div') {
        // Check if this is a KaTeX math element
        const className = (child as any).className || '';
        if (className.includes('katex')) {
          // Try data attribute first
          let latex = child.getAttribute('data-latex');
          
          // Fallback to annotation
          if (!latex) {
            const annotation = (child as any).querySelector('annotation[encoding="application/x-tex"]');
            if (annotation) latex = annotation.textContent;
          }

          if (latex) {
            // Render as embedded SVG image
            result += convertLatexToImageXml(latex, false);
          }
        } else {
          // Handle regular spans/divs by recursing
          result += processChildren(child);
        }
      } else {
        result += `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      }
    }
  });
  return result;
}

/**
 * Convert LaTeX to embedded SVG image in DOCX
 * Renders equation as high-quality SVG and embeds as image
 */
function convertLatexToImageXml(latex: string, isDisplay: boolean): string {
  try {
    // 1. Render LaTeX to SVG using KaTeX
    const svg = katex.renderToString(latex, {
      displayMode: isDisplay,
      output: 'html',
      throwOnError: false,
      strict: false
    });

    // Extract SVG from KaTeX HTML output
    const svgMatch = svg.match(/<svg[^>]*>[\s\S]*<\/svg>/);
    if (!svgMatch) {
      throw new Error('Failed to extract SVG from KaTeX output');
    }

    const svgContent = svgMatch[0];
    
    // Parse SVG to get dimensions
    const widthMatch = svgContent.match(/width="([^"]+)"/);
    const heightMatch = svgContent.match(/height="([^"]+)"/);
    
    // Convert ex units to EMUs (English Metric Units for Word)
    // 1ex ≈ 0.5em ≈ 7 points ≈ 9525 EMUs
    const parseSize = (sizeStr: string): number => {
      const num = parseFloat(sizeStr);
      return Math.round(num * 9525); // Convert ex to EMUs
    };
    
    const widthEMU = widthMatch ? parseSize(widthMatch[1]) : 914400; // Default 1 inch
    const heightEMU = heightMatch ? parseSize(heightMatch[1]) : 914400;

    // Store SVG for embedding
    mathImageCounter++;
    const imageId = `mathImg${mathImageCounter}`;
    mathImages.push({ id: imageId, svg: svgContent });

    // Create Word XML for embedded image
    // Using inline image (w:r > w:drawing > wp:inline)
    const imageXml = `
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="${widthEMU}" cy="${heightEMU}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="${mathImageCounter}" name="Math Equation ${mathImageCounter}"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:nvPicPr>
                    <pic:cNvPr id="${mathImageCounter}" name="Math${mathImageCounter}.svg"/>
                    <pic:cNvPicPr/>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="rId${mathImageCounter + 4}"/>
                    <a:stretch>
                      <a:fillRect/>
                    </a:stretch>
                  </pic:blipFill>
                  <pic:spPr>
                    <a:xfrm>
                      <a:off x="0" y="0"/>
                      <a:ext cx="${widthEMU}" cy="${heightEMU}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                      <a:avLst/>
                    </a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>`;

    return imageXml;
  } catch (e) {
    // Fallback: If rendering fails, return as plain text
    console.error('Failed to render math equation:', e);
    return `<w:r><w:t xml:space="preserve">[Equation: ${escapeXml(latex)}]</w:t></w:r>`;
  }
}

/**
 * Process list items
 */
function processListItems(listNode: any, isOrdered: boolean): string {
  let result = '';
  const items = listNode.querySelectorAll(':scope > li');
  items.forEach((li: any) => {
    // We use processChildren here to preserve bold/italic/math inside list items
    result += `<w:p><w:pPr><w:pStyle w:val="${isOrdered ? 'ListNumber' : 'ListBullet'}"/></w:pPr>${processChildren(li)}</w:p>`;
  });
  return result;
}

/**
 * Process table
 */
function processTable(tableNode: any): string {
  let result = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="5000" w:type="pct"/></w:tblPr>';
  
  const rows = tableNode.querySelectorAll('tr');
  rows.forEach((row: any) => {
    result += '<w:tr>';
    const cells = row.querySelectorAll('th, td');
    cells.forEach((cell: any) => {
      const isHeader = cell.tagName.toLowerCase() === 'th';
      const text = cell.textContent.trim() || '';
      
      result += '<w:tc><w:tcPr>';
      if (isHeader) {
        result += '<w:shd w:fill="F0F0F0"/>';
      }
      result += '</w:tcPr><w:p><w:r>';
      if (isHeader) {
        result += '<w:rPr><w:b/></w:rPr>';
      }
      result += `<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p></w:tc>`;
    });
    result += '</w:tr>';
  });
  
  result += '</w:tbl>';
  return result;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get DOCX content types
 */
function getDocxContentTypes(imageCount: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Default Extension="svg" ContentType="image/svg+xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
    <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

/**
 * Get DOCX relationships
 */
function getDocxRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

/**
 * Get DOCX core properties
 */
function getDocxCoreProps(title: string, author: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" 
                   xmlns:dc="http://purl.org/dc/elements/1.1/" 
                   xmlns:dcterms="http://purl.org/dc/terms/" 
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:creator>${escapeXml(author || 'Converto')}</dc:creator>
    <cp:lastModifiedBy>${escapeXml(author || 'Converto')}</cp:lastModifiedBy>
    <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;
}

/**
 * Get DOCX app properties
 */
function getDocxAppProps(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
    <Application>Converto</Application>
    <AppVersion>2.0</AppVersion>
</Properties>`;
}

/**
 * Get DOCX document relationships (including image relationships)
 */
function getDocxDocumentRels(imageCount: number): string {
  let imageRels = '';
  for (let i = 1; i <= imageCount; i++) {
    imageRels += `    <Relationship Id="rId${i + 4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/math${i}.svg"/>\n`;
  }
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
${imageRels}</Relationships>`;
}

/**
 * Get DOCX styles with theme support
 */
function getDocxStyles(theme: string): string {
  // Theme-specific colors
  const colors = theme === 'bw' ? {
    title: '000000',
    subtitle: '000000',
    heading1: '000000',
    heading2: '000000',
    heading3: '000000',
    heading4: '000000',
    normal: '000000',
    quote: '404040',
    codeBg: 'F5F5F5',
    codeText: '000000'
  } : {
    title: '2E74B5',
    subtitle: '595959',
    heading1: '2E74B5',
    heading2: '2E74B5',
    heading3: '1F4D78',
    heading4: '2E74B5',
    normal: '000000',
    quote: '595959',
    codeBg: 'F2F2F2',
    codeText: '000000'
  };

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Calibri" w:cs="Times New Roman"/>
                <w:sz w:val="22"/>
                <w:szCs w:val="22"/>
                <w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>
    <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
        <w:name w:val="Normal"/>
        <w:qFormat/>
        <w:pPr>
            <w:spacing w:after="160" w:line="259" w:lineRule="auto"/>
        </w:pPr>
        <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            <w:sz w:val="22"/>
            <w:color w:val="000000"/>
        </w:rPr>
    </w:style>
    <w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont">
        <w:name w:val="Default Paragraph Font"/>
        <w:uiPriority w:val="1"/>
        <w:semiHidden/>
        <w:unhideWhenUsed/>
    </w:style>
    <w:style w:type="table" w:default="1" w:styleId="TableNormal">
        <w:name w:val="Normal Table"/>
        <w:uiPriority w:val="99"/>
        <w:semiHidden/>
        <w:unhideWhenUsed/>
        <w:tblPr>
            <w:tblInd w:w="0" w:type="dxa"/>
            <w:tblCellMar>
                <w:top w:w="0" w:type="dxa"/>
                <w:left w:w="108" w:type="dxa"/>
                <w:bottom w:w="0" w:type="dxa"/>
                <w:right w:w="108" w:type="dxa"/>
            </w:tblCellMar>
        </w:tblPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Title">
        <w:name w:val="Title"/>
        <w:basedOn w:val="Normal"/>
        <w:qFormat/>
        <w:pPr>
            <w:spacing w:before="240" w:after="200"/>
            <w:jc w:val="center"/>
        </w:pPr>
        <w:rPr>
            <w:b/>
            <w:sz w:val="56"/>
            <w:color w:val="${colors.title}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Subtitle">
        <w:name w:val="Subtitle"/>
        <w:basedOn w:val="Normal"/>
        <w:qFormat/>
        <w:pPr>
            <w:spacing w:after="120"/>
            <w:jc w:val="center"/>
        </w:pPr>
        <w:rPr>
            <w:i/>
            <w:sz w:val="28"/>
            <w:color w:val="${colors.subtitle}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="Heading 1"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="480" w:after="240"/>
        </w:pPr>
        <w:rPr>
            <w:b/>
            <w:sz w:val="36"/>
            <w:color w:val="${colors.heading1}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading2">
        <w:name w:val="Heading 2"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="320" w:after="160"/>
        </w:pPr>
        <w:rPr>
            <w:b/>
            <w:sz w:val="28"/>
            <w:color w:val="${colors.heading2}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading3">
        <w:name w:val="Heading 3"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="240" w:after="120"/>
        </w:pPr>
        <w:rPr>
            <w:b/>
            <w:sz w:val="24"/>
            <w:color w:val="${colors.heading3}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading4">
        <w:name w:val="Heading 4"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:qFormat/>
        <w:pPr>
            <w:keepNext/>
            <w:spacing w:before="160" w:after="80"/>
        </w:pPr>
        <w:rPr>
            <w:b/>
            <w:i/>
            <w:sz w:val="22"/>
            <w:color w:val="${colors.heading4}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="CodeBlock">
        <w:name w:val="Code Block"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:spacing w:before="200" w:after="200"/>
            <w:shd w:fill="${colors.codeBg}"/>
        </w:pPr>
        <w:rPr>
            <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>
            <w:sz w:val="20"/>
            <w:color w:val="${colors.codeText}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Quote">
        <w:name w:val="Quote"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:ind w:left="720"/>
            <w:spacing w:before="200" w:after="200"/>
        </w:pPr>
        <w:rPr>
            <w:i/>
            <w:color w:val="${colors.quote}"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="ListBullet">
        <w:name w:val="List Bullet"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:ind w:left="720"/>
        </w:pPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="ListNumber">
        <w:name w:val="List Number"/>
        <w:basedOn w:val="Normal"/>
        <w:pPr>
            <w:ind w:left="720"/>
        </w:pPr>
    </w:style>
    <w:style w:type="table" w:styleId="TableGrid">
        <w:name w:val="Table Grid"/>
        <w:basedOn w:val="TableNormal"/>
        <w:uiPriority w:val="39"/>
        <w:tblPr>
            <w:tblBorders>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="BFBFBF"/>
            </w:tblBorders>
        </w:tblPr>
    </w:style>
</w:styles>`;
}

/**
 * Get DOCX font table
 */
function getDocxFontTable(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
         xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:font w:name="Calibri">
        <w:panose1 w:val="020F0502020204030204"/>
        <w:charset w:val="00"/>
        <w:family w:val="swiss"/>
        <w:pitch w:val="variable"/>
    </w:font>
    <w:font w:name="Consolas">
        <w:panose1 w:val="020B0609020204030204"/>
        <w:charset w:val="00"/>
        <w:family w:val="modern"/>
        <w:pitch w:val="fixed"/>
    </w:font>
</w:fonts>`;
}

/**
 * Get DOCX settings
 */
function getDocxSettings(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:zoom w:percent="100"/>
    <w:defaultTabStop w:val="720"/>
    <w:characterSpacingControl w:val="doNotCompress"/>
    <w:compat>
        <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
    </w:compat>
</w:settings>`;
}
