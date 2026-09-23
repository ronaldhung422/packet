@echo off
REM Packet 部署前檢查腳本 (Windows)

echo 🔍 Packet 部署前檢查
echo ====================
echo.

REM 1. 檢查環境變數
echo ✓ 檢查環境變數...
if exist .env (
    echo   ✓ .env 檔案存在
    findstr /C:"VITE_SUPABASE_URL=https://cfmswewmfaahthjlkshg.supabase.co" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   ✓ Supabase URL 已設定
    ) else (
        echo   ✗ Supabase URL 未設定或錯誤
    )
    
    findstr /C:"VITE_SUPABASE_ANON_KEY=eyJ" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   ✓ Supabase Anon Key 已設定
    ) else (
        echo   ✗ Supabase Anon Key 未設定
    )
) else (
    echo   ✗ .env 檔案不存在
)

echo.

REM 2. 檢查依賴安裝
echo ✓ 檢查 npm 依賴...
if exist node_modules (
    echo   ✓ node_modules 存在
) else (
    echo   ✗ node_modules 不存在，需要執行 npm install
)

echo.

REM 3. 檢查 dist 目錄
echo ✓ 檢查產物...
if exist dist (
    echo   ✓ dist\ 目錄存在
    
    if exist dist\index.html (
        echo   ✓ index.html 已產生
    )
    
    if exist dist\sw.js (
        echo   ✓ Service Worker 已產生
    )
) else (
    echo   ✗ dist\ 目錄不存在，需要執行 npm run build
)

echo.
echo ====================
echo 📋 下一步：
echo 1. 確認 Supabase migration 已執行（見 SUPABASE_SETUP.md）
echo 2. 執行 'npm run build' 建置
echo 3. 執行 'npx vercel --prod' 或 'npx netlify deploy --prod' 部署
echo 4. 在 iPhone Safari 開啟部署後的 URL
echo 5. 加入主畫面螢幕
echo 6. 開始配對並使用！
echo.

pause
