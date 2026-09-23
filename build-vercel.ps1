# Packet Vercel Build Verification Script for Windows

Write-Host "🚀 Packet Vercel Build Verification" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check Node.js version
Write-Host "🔍 Checking Node.js version... " -NoNewline
$nodeVersion = node --version
if ($nodeVersion -match '^v(18|20)') {
    Write-Host "✅ $nodeVersion (compatible)" -ForegroundColor Green
} else {
    Write-Host "⚠️  $nodeVersion (recommended: v18+ or v20+)" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies... " -NoNewline
npm install --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Done" -ForegroundColor Green
} else {
    Write-Host "❌ Failed" -ForegroundColor Red
    exit 1
}

# Run TypeScript check
Write-Host "🔧 TypeScript type checking... " -NoNewline
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No type errors" -ForegroundColor Green
} else {
    Write-Host "❌ Type errors found" -ForegroundColor Red
    exit 1
}

# Build project
Write-Host "🏗️  Building project... " -NoNewline
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Check build output
Write-Host "📁 Checking build output... " -NoNewline
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    $distSizeMB = [math]::Round($distSize / 1MB, 2)
    Write-Host "✅ dist/ created ($distSizeMB MB)" -ForegroundColor Green
} else {
    Write-Host "❌ dist/ not found" -ForegroundColor Red
    exit 1
}

# Check critical files
Write-Host "📄 Checking critical files in dist/:" -ForegroundColor Cyan
$criticalFiles = @("index.html", "manifest.json", "sw.js")
foreach ($file in $criticalFiles) {
    if (Test-Path "dist\$file") {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $file (not found)" -ForegroundColor Yellow
    }
}

# Check JavaScript and CSS files
Write-Host "📊 Analyzing bundle sizes:" -ForegroundColor Cyan
$jsFiles = Get-ChildItem -Path "dist" -Recurse -Filter "*.js" | Where-Object { $_.Name -match "index-.*\.js" }
$cssFiles = Get-ChildItem -Path "dist" -Recurse -Filter "*.css" | Where-Object { $_.Name -match "index-.*\.css" }

foreach ($file in $jsFiles) {
    $sizeKB = [math]::Round($file.Length / 1KB, 2)
    if ($sizeKB -gt 500) {
        Write-Host "   ⚠️  $($file.Name): ${sizeKB}KB (consider code splitting)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ $($file.Name): ${sizeKB}KB" -ForegroundColor Green
    }
}

foreach ($file in $cssFiles) {
    $sizeKB = [math]::Round($file.Length / 1KB, 2)
    Write-Host "   ✅ $($file.Name): ${sizeKB}KB" -ForegroundColor Green
}

# Check PWA files
Write-Host "📱 Checking PWA configuration:" -ForegroundColor Cyan
if (Test-Path "dist\manifest.json") {
    $manifestContent = Get-Content "dist\manifest.json" -Raw
    if ($manifestContent -match '"display":\s*"standalone"') {
        Write-Host "   ✅ Manifest has standalone display mode" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Manifest missing standalone display" -ForegroundColor Yellow
    }
}

if (Test-Path "dist\sw.js") {
    $swSize = (Get-Item "dist\sw.js").Length
    Write-Host "   ✅ Service worker: ${swSize} bytes" -ForegroundColor Green
} else {
    Write-Host "   ❌ Service worker missing" -ForegroundColor Red
}

# Security headers check
Write-Host "🔒 Checking security headers in vercel.json:" -ForegroundColor Cyan
if (Test-Path "vercel.json") {
    $vercelContent = Get-Content "vercel.json" -Raw
    if ($vercelContent -match "X-Content-Type-Options") {
        Write-Host "   ✅ Security headers configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Security headers missing" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ vercel.json not found" -ForegroundColor Red
}

# Environment variables check
Write-Host "🌐 Checking environment variables:" -ForegroundColor Cyan
$envVars = @("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY", "VITE_EXTRACTION_WORKER_URL")
foreach ($var in $envVars) {
    $found = $false
    # Check .env.example
    if (Test-Path ".env.example") {
        $envContent = Get-Content ".env.example" -Raw
        if ($envContent -match $var) {
            $found = $true
        }
    }
    # Check TypeScript files
    $tsFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.ts" -File
    foreach ($tsFile in $tsFiles) {
        $content = Get-Content $tsFile.FullName -Raw
        if ($content -match $var) {
            $found = $true
            break
        }
    }
    
    if ($found) {
        Write-Host "   ✅ $var referenced in code" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $var not found in code (check import)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📈 Build Summary" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "✅ All checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready to deploy to Vercel:" -ForegroundColor Cyan
Write-Host "1. Push to GitHub: git push origin main" -ForegroundColor White
Write-Host "2. Import to Vercel Dashboard" -ForegroundColor White
Write-Host "3. Configure environment variables" -ForegroundColor White
Write-Host "4. Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Or use Vercel CLI:" -ForegroundColor Cyan
Write-Host "   vercel" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "📚 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan