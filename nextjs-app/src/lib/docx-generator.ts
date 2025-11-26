import JSZip from 'jszip';
import { JSDOM } from 'jsdom';

interface DocxOptions {
  content: string;
  title?: string;
  author?: string;
  date?: string;
  theme?: 'color' | 'bw';
}

/**
 * Generate DOCX document from markdown content using JSZip
 * Based on the working implementation from the original app
 */
export async function generateDocx(options: DocxOptions): Promise<ArrayBuffer> {
  const {
    content,
    title = 'Document',
    author = 'Converto',
    date = new Date().toLocaleDateString(),
    theme = 'color'
  } = options;

  // Parse HTML content
  const dom = new JSDOM(content);
  const doc = dom.window.document;

  // Build Word XML document
  const docXml = createDocxXml(title, author, date, doc.body.innerHTML, theme);

  // Create ZIP structure for DOCX
  const zip = new JSZip();

  // Add required DOCX files
  zip.file('[Content_Types].xml', getDocxContentTypes());
  zip.file('_rels/.rels', getDocxRels());
  zip.file('docProps/app.xml', getDocxAppProps());
  zip.file('docProps/core.xml', getDocxCoreProps(title, author));
  zip.file('word/_rels/document.xml.rels', getDocxDocumentRels());
  zip.file('word/document.xml', docXml);
  zip.file('word/styles.xml', getDocxStyles(theme));
  zip.file('word/fontTable.xml', getDocxFontTable());
  zip.file('word/settings.xml', getDocxSettings());

  // Generate DOCX buffer
  const buffer = await zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
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

  // Add title section
  wordXml += `<w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;

  // Add metadata section
  if (author || date) {
    const metaText = [author, date].filter(Boolean).join(' • ');
    wordXml += `<w:p><w:pPr><w:pStyle w:val="Subtitle"/></w:pPr><w:r><w:t>${escapeXml(metaText)}</w:t></w:r></w:p>`;
  }

  // Process body content
  const processNode = (node: any): string => {
    if (!node) return '';

    if (node.nodeType === 3) { // Text node
      const text = node.textContent || '';
      if (text.trim()) {
        return `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      }
      return '';
    }

    if (node.nodeType === 1) { // Element node
      const tagName = node.tagName?.toLowerCase();
      
      switch (tagName) {
        case 'h1': {
          const content = processChildren(node) || '<w:r><w:t></w:t></w:r>';
          return `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr>${content}</w:p>`;
        }
        case 'h2': {
          const content = processChildren(node) || '<w:r><w:t></w:t></w:r>';
          return `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr>${content}</w:p>`;
        }
        case 'h3': {
          const content = processChildren(node) || '<w:r><w:t></w:t></w:r>';
          return `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr>${content}</w:p>`;
        }
        case 'h4': {
          const content = processChildren(node) || '<w:r><w:t></w:t></w:r>';
          return `<w:p><w:pPr><w:pStyle w:val="Heading4"/></w:pPr>${content}</w:p>`;
        }
        case 'p': {
          const content = processChildren(node) || '<w:r><w:t></w:t></w:r>';
          return `<w:p>${content}</w:p>`;
        }
        case 'strong':
        case 'b':
          return `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(node.textContent)}</w:t></w:r>`;
        case 'em':
        case 'i':
          return `<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">${escapeXml(node.textContent)}</w:t></w:r>`;
        case 'code':
          if (node.parentElement && node.parentElement.tagName.toLowerCase() === 'pre') {
            return ''; // Handled by pre
          }
          return `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:shd w:fill="F2F2F2"/></w:rPr><w:t xml:space="preserve">${escapeXml(node.textContent)}</w:t></w:r>`;
        case 'pre':
          const codeText = node.textContent;
          return `<w:p><w:pPr><w:pStyle w:val="CodeBlock"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="000000"/></w:rPr><w:t xml:space="preserve">${escapeXml(codeText)}</w:t></w:r></w:p>`;
        case 'ul':
        case 'ol':
          return processListItems(node, tagName === 'ol');
        case 'blockquote': {
          const content = processChildren(node) || '<w:r><w:t></w:t></w:r>';
          return `<w:p><w:pPr><w:pStyle w:val="Quote"/></w:pPr>${content}</w:p>`;
        }
        case 'table':
          return processTable(node);
        case 'br':
          return '<w:r><w:br/></w:r>';
        default:
          return processChildren(node);
      }
    }
    return '';
  };

  Array.from(doc.body.childNodes).forEach((node: any) => {
    wordXml += processNode(node);
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" 
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <w:body>
        ${wordXml}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
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
      } else {
        result += `<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
      }
    }
  });
  return result;
}

/**
 * Process list items
 */
function processListItems(listNode: any, isOrdered: boolean): string {
  let result = '';
  const items = listNode.querySelectorAll(':scope > li');
  items.forEach((li: any) => {
    const text = li.textContent.trim() || '';
    result += `<w:p><w:pPr><w:pStyle w:val="${isOrdered ? 'ListNumber' : 'ListBullet'}"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
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
function getDocxContentTypes(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
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
 * Get DOCX document relationships
 */
function getDocxDocumentRels(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;
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
