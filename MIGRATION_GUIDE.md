# Migration Guide: Client-Side to Next.js Full-Stack Application

## Overview
This guide will help you migrate the current client-side Converto application to a full-stack Next.js application with server-side processing to match BibCit's functionality.

## Architecture Changes

### Current (Client-Side Only)
```
Browser → HTML/CSS/JS → Export (Limited Quality)
```

### New (Full-Stack Next.js)
```
Browser → Next.js Frontend → API Routes → Server Processing → High-Quality Export
```

## Migration Steps

### Step 1: Initialize Next.js Project
```powershell
# Create new Next.js app in a separate directory
cd d:\
npx create-next-app@latest converto-nextjs --typescript --tailwind --app --no-src-dir

# Move into the new project
cd converto-nextjs
```

### Step 2: Install Required Dependencies
```powershell
# Core dependencies
npm install marked highlight.js katex file-saver

# Server-side dependencies
npm install puppeteer puppeteer-core
npm install docx officegen
npm install mammoth jsdom
npm install latex-to-mathml mathml-to-svg
npm install @types/marked @types/katex

# Optional: For better performance
npm install sharp canvas
```

### Step 3: Project Structure
```
converto-nextjs/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main editor page
│   ├── api/
│   │   ├── export/
│   │   │   ├── docx/route.ts  # DOCX export endpoint
│   │   │   ├── pdf/route.ts   # PDF export endpoint
│   │   │   └── html/route.ts  # HTML export endpoint
│   │   └── convert/
│   │       └── latex/route.ts  # LaTeX to OMML conversion
│   └── globals.css
├── components/
│   ├── Editor.tsx              # Markdown editor
│   ├── Preview.tsx             # Live preview
│   ├── Toolbar.tsx             # Formatting toolbar
│   └── ExportButtons.tsx       # Export controls
├── lib/
│   ├── markdown-converter.ts   # Markdown processing
│   ├── latex-converter.ts      # LaTeX to OMML
│   ├── pdf-generator.ts        # PDF generation
│   └── docx-generator.ts       # DOCX generation
├── public/
│   └── styles/                 # CSS files
└── package.json
```

## Key Implementation Files

All implementation files have been created in the root directory with `nextjs-` prefix:
- `nextjs-package.json` - Dependencies
- `nextjs-layout.tsx` - App layout
- `nextjs-page.tsx` - Main page
- `nextjs-Editor.tsx` - Editor component
- `nextjs-ExportButtons.tsx` - Export UI
- `nextjs-markdown-converter.ts` - Markdown processor
- `nextjs-latex-converter.ts` - LaTeX to OMML
- `nextjs-docx-generator.ts` - DOCX generator
- `nextjs-pdf-generator.ts` - PDF generator
- `nextjs-route-docx.ts` - DOCX API
- `nextjs-route-pdf.ts` - PDF API

## Features Matching BibCit

### ✅ LaTeX/KaTeX Support
- Multiple input formats: `$$`, `$`, `\[`, `\(`, ChatGPT style
- Server-side conversion to native Word equations (OMML)
- High-quality PDF rendering

### ✅ True DOCX Export
- Native .docx format (OpenXML)
- Editable equations in Word
- Full formatting preservation
- Tables, code blocks, images

### ✅ Professional PDF Export
- Server-side Puppeteer rendering
- Vector graphics for equations
- Custom styling and themes
- Page numbers and headers

### ✅ Advanced Features
- Syntax highlighting preservation
- Table formatting
- Dark/Light theme support
- Citation support ready
- Image handling

## Development Workflow

### 1. Copy Current Assets
```powershell
# Copy your current styles and assets
Copy-Item d:\convert\styles.css d:\converto-nextjs\app\globals.css
```

### 2. Start Development Server
```powershell
cd d:\converto-nextjs
npm run dev
```

### 3. Test Exports
- Visit http://localhost:3000
- Test DOCX export: Uses server-side native OMML conversion
- Test PDF export: Uses Puppeteer for high quality
- Test HTML export: Enhanced with better styling

## API Endpoints

### POST /api/export/docx
Convert markdown to native DOCX with equations
```typescript
Body: {
  content: string,      // Markdown content
  title?: string,       // Document title
  author?: string,      // Author name
  theme?: 'light' | 'dark'
}
Response: Binary DOCX file
```

### POST /api/export/pdf
Generate high-quality PDF
```typescript
Body: {
  content: string,
  title?: string,
  author?: string,
  theme?: 'light' | 'dark'
}
Response: Binary PDF file
```

### POST /api/export/html
Generate standalone HTML
```typescript
Body: {
  content: string,
  title?: string,
  theme?: 'light' | 'dark'
}
Response: Binary HTML file
```

## Performance Considerations

### Server-Side Optimization
- Puppeteer runs in headless mode
- Equation caching for repeated exports
- Concurrent export processing
- Resource cleanup after generation

### Client-Side Optimization
- Debounced preview updates
- Lazy loading for heavy components
- Code splitting
- Image optimization with Next.js Image

## Deployment Options

### Option 1: Vercel (Recommended)
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
cd d:\converto-nextjs
vercel
```

**Note**: Puppeteer requires additional setup on Vercel:
- Use `@sparticuz/chromium` for Lambda
- Configure memory limits

### Option 2: Self-Hosted (Full Control)
```powershell
# Build for production
npm run build

# Start production server
npm start
```

### Option 3: Docker Container
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Migration Checklist

- [ ] Create Next.js project
- [ ] Install dependencies
- [ ] Copy and adapt components
- [ ] Implement API routes
- [ ] Test DOCX export with equations
- [ ] Test PDF export quality
- [ ] Implement dark theme support
- [ ] Add citation features
- [ ] Performance testing
- [ ] Deploy to production

## Advantages Over Current Implementation

| Feature | Current | New Next.js |
|---------|---------|-------------|
| DOCX Format | .doc (HTML) | .docx (OpenXML) |
| Equations in Word | HTML/Images | Native OMML (Editable) |
| PDF Quality | Medium | High (Puppeteer) |
| File Size | Larger | Optimized |
| Equation Editing | No | Yes |
| Server Processing | No | Yes |
| Scalability | Limited | High |
| Citation Support | Basic | Advanced |

## Next Steps

1. Review all `nextjs-*.ts|tsx` files in the root directory
2. Create the Next.js project structure
3. Copy the implementation files to appropriate locations
4. Test each export format
5. Deploy to production

## Support & Resources

- Next.js Docs: https://nextjs.org/docs
- Puppeteer Docs: https://pptr.dev
- DOCX Library: https://docx.js.org
- KaTeX: https://katex.org

---

**Ready to migrate?** Start with Step 1 and follow the guide sequentially.
