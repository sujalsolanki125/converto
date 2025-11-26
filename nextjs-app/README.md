# Converto - Next.js Version

A full-stack document converter with server-side processing for converting Markdown to HTML, DOCX, and PDF formats.

## 🚀 Deployment on Vercel

### Prerequisites
- A [Vercel account](https://vercel.com/signup)
- Git repository with this code

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js configuration
   - Click "Deploy"

### Environment Variables (Optional)

No environment variables are required for basic deployment. The app works out of the box!

If you want to customize, add these in Vercel dashboard:
- `NEXT_PUBLIC_APP_NAME` - Application name (default: "Converto")
- `NEXT_PUBLIC_APP_VERSION` - Version number (default: "2.0.0")

### Build Configuration

Vercel will automatically use:
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Framework**: Next.js
- **Node Version**: 18.x or higher

### PDF Generation Note

The app uses Puppeteer for PDF generation. Vercel provides Chrome in serverless functions automatically, but:
- First PDF generation may be slower (cold start)
- Function timeout is set to 60 seconds
- Memory is set to 3008 MB for better performance

## 📦 Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   ```
   http://localhost:3000
   ```

## 🏗️ Production Build

Test production build locally:

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
nextjs-app/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Main page
│   │   ├── layout.tsx    # Root layout
│   │   └── api/          # API routes
│   │       └── export/   # Export endpoints
│   ├── components/       # React components
│   │   ├── Editor.tsx
│   │   ├── Preview.tsx
│   │   └── ExportButtons.tsx
│   └── lib/              # Utility libraries
│       ├── markdown-converter.ts
│       ├── pdf-generator.ts
│       └── docx-generator.ts
├── public/               # Static assets
├── next.config.js        # Next.js configuration
└── package.json          # Dependencies
```

## ✨ Features

- **Markdown Editor** with live preview
- **Export Formats**: HTML, DOCX, PDF
- **Math Support**: LaTeX equations via KaTeX
- **Code Highlighting**: Syntax highlighting for code blocks
- **Tables & Images**: Full markdown table and image support
- **Themes**: Color and B&W themes for exports
- **Server-side Processing**: All conversions happen on the server

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Markdown**: Marked.js
- **Math**: KaTeX
- **Code Highlighting**: Highlight.js
- **PDF**: Puppeteer
- **DOCX**: JSZip + JSDOM
- **Deployment**: Vercel

## 📝 Deployment Checklist

- [x] Production build successful
- [x] TypeScript compilation clean
- [x] ESLint checks passing
- [x] Environment variables configured
- [x] Vercel configuration optimized
- [x] Error handling implemented
- [x] Security headers added
- [x] Performance optimizations applied

## 🐛 Troubleshooting

### PDF Generation Issues
- Ensure Puppeteer dependencies are installed
- Check Vercel function logs for errors
- Verify memory limits in `vercel.json`

### Build Failures
- Clear `.next` folder and rebuild
- Delete `node_modules` and reinstall
- Check Node.js version (18.x required)

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

## 🤝 Support

For issues or questions:
1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review [Vercel deployment guide](https://vercel.com/docs)
3. Open an issue in the repository

---

**Built with ❤️ for seamless document conversion**
