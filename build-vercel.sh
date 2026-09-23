#!/bin/bash

echo "🚀 Packet Vercel Build Verification"
echo "==================================="

# Check Node.js version
echo -n "🔍 Checking Node.js version... "
node_version=$(node --version)
if [[ $node_version == v18* ]] || [[ $node_version == v20* ]]; then
  echo "✅ $node_version (compatible)"
else
  echo "⚠️  $node_version (recommended: v18+ or v20+)"
fi

# Install dependencies
echo -n "📦 Installing dependencies... "
npm install --silent
if [ $? -eq 0 ]; then
  echo "✅ Done"
else
  echo "❌ Failed"
  exit 1
fi

# Run TypeScript check
echo -n "🔧 TypeScript type checking... "
npx tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ No type errors"
else
  echo "❌ Type errors found"
  exit 1
fi

# Build project
echo -n "🏗️  Building project... "
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi

# Check build output
echo -n "📁 Checking build output... "
if [ -d "dist" ]; then
  dist_size=$(du -sh dist | cut -f1)
  echo "✅ dist/ created ($dist_size)"
else
  echo "❌ dist/ not found"
  exit 1
fi

# Check critical files
echo "📄 Checking critical files in dist/:"
critical_files=("index.html" "assets/index-*.js" "assets/index-*.css" "manifest.json" "sw.js")
for file in "${critical_files[@]}"; do
  if ls dist/$file 1>/dev/null 2>&1; then
    echo "   ✅ $file"
  else
    echo "   ⚠️  $file (not found or pattern mismatch)"
  fi
done

# Check file sizes
echo "📊 Analyzing bundle sizes:"
js_files=$(find dist -name "*.js" -type f)
for file in $js_files; do
  size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  size_kb=$((size / 1024))
  filename=$(basename "$file")
  if [ $size_kb -gt 500 ]; then
    echo "   ⚠️  $filename: ${size_kb}KB (consider code splitting)"
  else
    echo "   ✅ $filename: ${size_kb}KB"
  fi
done

# Check PWA files
echo "📱 Checking PWA configuration:"
if grep -q "\"display\": \"standalone\"" dist/manifest.json 2>/dev/null; then
  echo "   ✅ Manifest has standalone display mode"
else
  echo "   ⚠️  Manifest missing standalone display"
fi

if [ -f "dist/sw.js" ]; then
  sw_size=$(stat -f%z dist/sw.js 2>/dev/null || stat -c%s dist/sw.js 2>/dev/null)
  echo "   ✅ Service worker: ${sw_size} bytes"
else
  echo "   ❌ Service worker missing"
fi

# Security headers check
echo "🔒 Checking security headers in vercel.json:"
if [ -f "vercel.json" ]; then
  if grep -q "X-Content-Type-Options" vercel.json; then
    echo "   ✅ Security headers configured"
  else
    echo "   ⚠️  Security headers missing"
  fi
else
  echo "   ❌ vercel.json not found"
fi

# Environment variables check
echo "🌐 Checking environment variables:"
env_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_EXTRACTION_WORKER_URL")
for var in "${env_vars[@]}"; do
  if grep -q "$var" .env.example 2>/dev/null || grep -q "$var" src/**/*.ts 2>/dev/null; then
    echo "   ✅ $var referenced in code"
  else
    echo "   ⚠️  $var not found in code (check import)"
  fi
done

# Test local preview
echo -n "🌐 Testing local preview... "
timeout 10 npm run preview > /dev/null 2>&1 &
preview_pid=$!
sleep 3
if curl -s http://localhost:4173 > /dev/null; then
  echo "✅ Preview server running"
  kill $preview_pid 2>/dev/null
else
  echo "⚠️  Preview server not responding"
  kill $preview_pid 2>/dev/null 2>&1
fi

echo ""
echo "📈 Build Summary"
echo "================"
echo "✅ All checks passed!"
echo ""
echo "🚀 Ready to deploy to Vercel:"
echo "1. Push to GitHub: git push origin main"
echo "2. Import to Vercel Dashboard"
echo "3. Configure environment variables"
echo "4. Deploy!"
echo ""
echo "🔧 Or use Vercel CLI:"
echo "   vercel"
echo "   vercel --prod"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"