# Converto Next.js Deployment Script
# This script automates the entire setup process

Write-Host "Starting Converto Next.js Deployment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Create Next.js project
Write-Host "Step 1: Creating Next.js project..." -ForegroundColor Yellow
cd d:\
npx create-next-app@latest converto-nextjs --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create Next.js project" -ForegroundColor Red
    exit 1
}

Write-Host "Next.js project created successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Navigate to project directory
cd d:\converto-nextjs

# Step 3: Install dependencies
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install marked highlight.js katex file-saver puppeteer docx officegen mammoth jsdom latex-to-mathml mathml-to-svg sharp canvas @types/marked @types/katex @types/file-saver @types/jsdom

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Create directory structure
Write-Host "Step 3: Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "components" | Out-Null
New-Item -ItemType Directory -Force -Path "lib" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\export\docx" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\export\pdf" | Out-Null
New-Item -ItemType Directory -Force -Path "app\api\export\html" | Out-Null

Write-Host "Directory structure created" -ForegroundColor Green
Write-Host ""

# Step 5: Copy implementation files
Write-Host "Step 4: Copying implementation files..." -ForegroundColor Yellow

# Copy app files
Copy-Item "d:\convert\nextjs-layout.tsx" -Destination "app\layout.tsx" -Force
Copy-Item "d:\convert\nextjs-page.tsx" -Destination "app\page.tsx" -Force
Copy-Item "d:\convert\nextjs-globals.css" -Destination "app\globals.css" -Force

# Copy component files
Copy-Item "d:\convert\nextjs-Editor.tsx" -Destination "components\Editor.tsx" -Force
Copy-Item "d:\convert\nextjs-Preview.tsx" -Destination "components\Preview.tsx" -Force
Copy-Item "d:\convert\nextjs-ExportButtons.tsx" -Destination "components\ExportButtons.tsx" -Force

# Copy lib files
Copy-Item "d:\convert\nextjs-markdown-converter.ts" -Destination "lib\markdown-converter.ts" -Force
Copy-Item "d:\convert\nextjs-latex-converter.ts" -Destination "lib\latex-converter.ts" -Force
Copy-Item "d:\convert\nextjs-docx-generator.ts" -Destination "lib\docx-generator.ts" -Force
Copy-Item "d:\convert\nextjs-pdf-generator.ts" -Destination "lib\pdf-generator.ts" -Force

# Copy API routes
Copy-Item "d:\convert\nextjs-route-docx.ts" -Destination "app\api\export\docx\route.ts" -Force
Copy-Item "d:\convert\nextjs-route-pdf.ts" -Destination "app\api\export\pdf\route.ts" -Force
Copy-Item "d:\convert\nextjs-route-html.ts" -Destination "app\api\export\html\route.ts" -Force

Write-Host "Implementation files copied" -ForegroundColor Green
Write-Host ""

# Step 6: Update package.json with additional scripts
Write-Host "Step 5: Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "build:prod" -Value "next build" -Force
$packageJson.scripts | Add-Member -MemberType NoteProperty -Name "export" -Value "next build && next export" -Force
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Write-Host "package.json updated" -ForegroundColor Green
Write-Host ""

# Step 7: Create next.config.js with optimizations
Write-Host "Creating Next.js config..." -ForegroundColor Yellow
$configContent = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
}

module.exports = nextConfig
'@
$configContent | Out-File -FilePath "next.config.js" -Encoding utf8

Write-Host "Next.js config created" -ForegroundColor Green
Write-Host ""

# Step 8: Create .env.local for environment variables
Write-Host "Creating environment file..." -ForegroundColor Yellow
$envContent = @'
# Puppeteer Configuration
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=

# App Configuration
NEXT_PUBLIC_APP_NAME=Converto
NEXT_PUBLIC_APP_VERSION=2.0.0
'@
$envContent | Out-File -FilePath ".env.local" -Encoding utf8

Write-Host "Environment file created" -ForegroundColor Green
Write-Host ""

# Step 9: Start development server
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. cd d:\converto-nextjs" -ForegroundColor White
Write-Host "  2. npm run dev" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "To start the development server now, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to start dev server now
$response = Read-Host "Would you like to start the development server now? (Y/N)"
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Cyan
    npm run dev
}
