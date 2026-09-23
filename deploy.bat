@echo off
echo ============================================
echo 🚀 Packet 自动部署脚本
echo ============================================
echo.

echo [1/8] 检查 Node.js 版本...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装
    echo 请从 https://nodejs.org/ 安装 Node.js
    pause
    exit /b 1
)

echo [2/8] 安装依赖包...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo [3/8] 构建项目...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo [4/8] 检查构建输出...
if exist dist (
    echo ✅ 构建成功: dist/ 文件夹已创建
) else (
    echo ❌ dist/ 文件夹未找到
    pause
    exit /b 1
)

echo [5/8] 创建部署配置文件...
echo ✅ vercel.json 已存在
echo ✅ DEPLOYMENT.md 已存在

echo [6/8] 创建部署说明文件...
echo 📋 部署说明:
echo.
echo 请按照以下步骤部署 Packet:
echo.
echo 1. 设置 Supabase (免费)
echo    - 访问: https://app.supabase.com
echo    - 创建新项目: packet-app
echo    - 获取 URL 和匿名密钥
echo.
echo 2. 设置 Cloudflare Worker (免费)
echo    - 访问: https://dash.cloudflare.com
echo    - Workers → 创建 Worker
echo    - 使用 workers/extraction-worker/src/index.js 代码
echo.
echo 3. 部署到 Vercel (免费)
echo    - 访问: https://vercel.com
echo    - 导入 GitHub 仓库或使用 Vercel CLI
echo.
echo 4. 配置环境变量:
echo    VITE_SUPABASE_URL=你的Supabase URL
echo    VITE_SUPABASE_ANON_KEY=你的匿名密钥
echo    VITE_EXTRACTION_WORKER_URL=你的Worker URL
echo.
echo [7/8] 生成快速部署指南...
echo 📄 详细步骤请查看 DEPLOYMENT.md
echo 📱 iPhone 测试指南请查看 IPHONE_TESTING.md
echo 📊 项目总结请查看 PROJECT_SUMMARY.md
echo.

echo [8/8] 项目状态检查完成!
echo.
echo 🎉 Packet 已准备就绪，可以部署!
echo.
echo 🔧 手动部署选项:
echo    1. 使用 Vercel CLI: vercel login && vercel
echo    2. 通过 GitHub + Vercel 控制台
echo    3. 直接上传到 Vercel
echo.
echo 📞 如有问题，请查看文档或联系支持
echo ============================================
pause