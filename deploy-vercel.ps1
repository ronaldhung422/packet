# Packet Vercel 部署脚本

Write-Host "🚀 Packet Vercel 部署" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# 检查 Vercel CLI
Write-Host "检查 Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Vercel CLI $vercelVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Vercel CLI 未安装" -ForegroundColor Red
    Write-Host "安装命令: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# 登录检查
Write-Host "检查登录状态..." -ForegroundColor Yellow
$loginCheck = vercel whoami 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 已登录为: $loginCheck" -ForegroundColor Green
} else {
    Write-Host "⚠️  需要登录" -ForegroundColor Yellow
    vercel login
}

# 显示当前配置
Write-Host "`n📋 当前配置:" -ForegroundColor Cyan
Write-Host "项目目录: c:\Users\Ronald Hung\Downloads\packet" -ForegroundColor White
Write-Host "框架: Vite" -ForegroundColor White
Write-Host "构建命令: npm run build" -ForegroundColor White
Write-Host "输出目录: dist" -ForegroundColor White

# 环境变量说明
Write-Host "`n🔧 需要设置的环境变量:" -ForegroundColor Cyan
Write-Host "1. VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "   值: https://你的项目.supabase.co" -ForegroundColor Gray
Write-Host "   获取: Supabase 项目设置 → API → Project URL" -ForegroundColor Gray

Write-Host "`n2. VITE_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "   值: 你的匿名密钥" -ForegroundColor Gray
Write-Host "   获取: Supabase 项目设置 → API → anon/public key" -ForegroundColor Gray

Write-Host "`n3. VITE_EXTRACTION_WORKER_URL" -ForegroundColor White
Write-Host "   值: https://packet-extraction-worker.你的用户名.workers.dev" -ForegroundColor Gray
Write-Host "   获取: Cloudflare Worker 部署后获得" -ForegroundColor Gray

# 部署选项
Write-Host "`n🎯 部署选项:" -ForegroundColor Cyan
Write-Host "1. 开发环境部署 (测试)" -ForegroundColor White
Write-Host "2. 生产环境部署" -ForegroundColor White
Write-Host "3. 设置环境变量" -ForegroundColor White
Write-Host "4. 取消" -ForegroundColor White

$choice = Read-Host "`n选择选项 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 开始开发环境部署..." -ForegroundColor Green
        vercel --env VITE_SUPABASE_URL="placeholder" --env VITE_SUPABASE_ANON_KEY="placeholder" --env VITE_EXTRACTION_WORKER_URL="placeholder"
    }
    "2" {
        Write-Host "`n🚀 开始生产环境部署..." -ForegroundColor Green
        
        # 获取环境变量
        $supabaseUrl = Read-Host "输入 VITE_SUPABASE_URL"
        $supabaseKey = Read-Host "输入 VITE_SUPABASE_ANON_KEY"
        $workerUrl = Read-Host "输入 VITE_EXTRACTION_WORKER_URL"
        
        # 部署命令
        $deployCommand = "vercel --prod --env VITE_SUPABASE_URL=`"$supabaseUrl`" --env VITE_SUPABASE_ANON_KEY=`"$supabaseKey`" --env VITE_EXTRACTION_WORKER_URL=`"$workerUrl`""
        
        Write-Host "`n执行命令: $deployCommand" -ForegroundColor Yellow
        Invoke-Expression $deployCommand
    }
    "3" {
        Write-Host "`n🔧 设置环境变量..." -ForegroundColor Green
        
        # 检查是否已有项目
        $projectCheck = vercel projects ls 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "现有项目:" -ForegroundColor White
            $projectCheck
        }
        
        # 设置环境变量
        Write-Host "`n使用以下命令设置环境变量:" -ForegroundColor Yellow
        Write-Host "vercel env add VITE_SUPABASE_URL" -ForegroundColor White
        Write-Host "vercel env add VITE_SUPABASE_ANON_KEY" -ForegroundColor White
        Write-Host "vercel env add VITE_EXTRACTION_WORKER_URL" -ForegroundColor White
        
        Write-Host "`n或一次性设置:" -ForegroundColor Yellow
        Write-Host "vercel env add VITE_SUPABASE_URL production" -ForegroundColor White
        Write-Host "vercel env add VITE_SUPABASE_ANON_KEY production" -ForegroundColor White
        Write-Host "vercel env add VITE_EXTRACTION_WORKER_URL production" -ForegroundColor White
    }
    "4" {
        Write-Host "取消部署" -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "无效选项" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🎉 部署完成！" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "下一步：" -ForegroundColor White
Write-Host "1. 测试部署的网站" -ForegroundColor Gray
Write-Host "2. 在 iPhone Safari 中测试 PWA 安装" -ForegroundColor Gray
Write-Host "3. 测试 Instagram 链接提取" -ForegroundColor Gray
Write-Host "4. 与 Kerry 分享！" -ForegroundColor Gray