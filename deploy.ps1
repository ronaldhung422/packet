# Quick Deploy Script
# Run this to deploy all new features to production

Write-Host "🚀 Deploying Packet with new features..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Features included:" -ForegroundColor Yellow
Write-Host "  ✅ Language Selector (繁體中文 / English)"
Write-Host "  ✅ Category System (9 food categories)"
Write-Host "  ✅ Fixed Settings Page"
Write-Host ""

# Change to project directory
Set-Location C:\Download\packet

# Check if Vercel CLI is installed
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Cyan
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or deploy manually via Vercel Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/dashboard" -ForegroundColor Green
    exit 1
}

Write-Host "✅ Vercel CLI found!" -ForegroundColor Green
Write-Host ""

# Deploy to production
Write-Host "🚀 Deploying to production..." -ForegroundColor Cyan
Write-Host "⏳ This may take 2-3 minutes..." -ForegroundColor Yellow
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your app is now live with:" -ForegroundColor Cyan
Write-Host "  • Language switching capability"
Write-Host "  • Beautiful category system"
Write-Host "  • Working settings page"
Write-Host ""
Write-Host "🌐 Visit: https://packet-kappa.vercel.app" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Read IMPLEMENTATION_SUMMARY.md for testing checklist" -ForegroundColor Yellow
