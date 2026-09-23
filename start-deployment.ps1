# Packet 部署启动脚本
Write-Host "🚀 开始 Packet 部署流程" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 临时设置执行策略
Write-Host "🔧 临时设置执行策略..." -ForegroundColor Yellow
$originalPolicy = Get-ExecutionPolicy
try {
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
} catch {
    Write-Host "⚠️  无法更改执行策略，继续..." -ForegroundColor Yellow
}

# 检查 Node.js
Write-Host "📦 检查 Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js $nodeVersion 已安装" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js 未安装" -ForegroundColor Red
    Write-Host "请从 https://nodejs.org/ 安装 Node.js" -ForegroundColor Yellow
    exit 1
}

# 检查 npm
Write-Host "📦 检查 npm..." -ForegroundColor Cyan
$npmVersion = cmd /c "npm --version 2>nul"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ npm $npmVersion 可用" -ForegroundColor Green
} else {
    Write-Host "⚠️  npm 检查失败，尝试继续..." -ForegroundColor Yellow
}

# 创建部署状态文件
Write-Host "📄 创建部署状态文件..." -ForegroundColor Cyan
$deployStatus = @"
# Packet 部署状态
创建时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Node版本: $nodeVersion
npm版本: $npmVersion
项目状态: 准备部署

## 已完成
- [x] 项目结构搭建
- [x] PWA 配置
- [x] 所有页面组件
- [x] 数据库架构
- [x] 部署配置

## 待完成
- [ ] 设置 Supabase 账户
- [ ] 设置 Cloudflare Worker
- [ ] 部署到 Vercel
- [ ] 测试 iPhone Safari

## 快速命令
```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 部署 URL
应用将部署到: https://packet-[随机].vercel.app

## 支持
查看 DEPLOYMENT.md 获取详细部署指南
"@

$deployStatus | Out-File -FilePath "DEPLOYMENT_STATUS.md" -Encoding UTF8
Write-Host "✅ 部署状态文件已创建" -ForegroundColor Green

# 显示下一步操作
Write-Host "`n🎯 下一步操作:" -ForegroundColor Cyan
Write-Host "1. 设置 Supabase (免费)" -ForegroundColor White
Write-Host "   访问: https://app.supabase.com" -ForegroundColor Gray
Write-Host "   创建项目: packet-app" -ForegroundColor Gray
Write-Host "   获取: URL 和匿名密钥" -ForegroundColor Gray
Write-Host "`n2. 设置 Cloudflare Worker (免费)" -ForegroundColor White
Write-Host "   访问: https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "   Workers → 创建 Worker" -ForegroundColor Gray
Write-Host "   使用: workers/extraction-worker/src/index.js" -ForegroundColor Gray
Write-Host "`n3. 部署到 Vercel (免费)" -ForegroundColor White
Write-Host "   访问: https://vercel.com" -ForegroundColor Gray
Write-Host "   或使用: vercel login && vercel" -ForegroundColor Gray
Write-Host "`n4. 配置环境变量:" -ForegroundColor White
Write-Host "   VITE_SUPABASE_URL=你的Supabase URL" -ForegroundColor Gray
Write-Host "   VITE_SUPABASE_ANON_KEY=你的匿名密钥" -ForegroundColor Gray
Write-Host "   VITE_EXTRACTION_WORKER_URL=你的Worker URL" -ForegroundColor Gray

# 创建环境变量模板
Write-Host "`n📋 创建环境变量模板..." -ForegroundColor Cyan
$envTemplate = @"
# Packet 环境变量模板
# 复制到 .env.local 文件

# Supabase 配置 (从 https://app.supabase.com 获取)
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=你的匿名密钥

# Cloudflare Worker 配置 (从 https://dash.cloudflare.com 获取)
VITE_EXTRACTION_WORKER_URL=https://packet-extraction-worker.你的用户名.workers.dev

# 本地开发
# 端口配置
PORT=3000
HOST=localhost
"@

$envTemplate | Out-File -FilePath ".env.template" -Encoding UTF8
Write-Host "✅ 环境变量模板已创建" -ForegroundColor Green

# 恢复原始执行策略
try {
    Set-ExecutionPolicy -ExecutionPolicy $originalPolicy -Scope Process -Force
} catch {
    # 忽略错误
}

Write-Host "`n🎉 部署准备完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📄 查看文件:" -ForegroundColor White
Write-Host "   - DEPLOYMENT.md (详细部署指南)" -ForegroundColor Gray
Write-Host "   - IPHONE_TESTING.md (iPhone测试指南)" -ForegroundColor Gray
Write-Host "   - PROJECT_SUMMARY.md (项目总结)" -ForegroundColor Gray
Write-Host "   - DEPLOYMENT_STATUS.md (部署状态)" -ForegroundColor Gray
Write-Host "   - .env.template (环境变量模板)" -ForegroundColor Gray
Write-Host "`n🚀 现在可以开始部署了!" -ForegroundColor Cyan
Write-Host "按 Enter 键退出..." -ForegroundColor Gray
Read-Host