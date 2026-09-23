@echo off
echo.
echo ========================================
echo   Packet - 快速部署到 Vercel
echo ========================================
echo.

REM 檢查是否已安裝 Vercel CLI
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/3] 安裝 Vercel CLI...
    call npm install -g vercel
) else (
    echo [1/3] Vercel CLI 已安裝 ✓
)

echo.
echo [2/3] 登入 Vercel...
echo 請在瀏覽器中完成登入...
call vercel login

echo.
echo [3/3] 部署到 Vercel...
echo.
call vercel --prod

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 下一步：
echo 1. 複製上方的部署 URL
echo 2. 在 Ronald 和 Kerry 的 iPhone Safari 開啟該 URL
echo 3. 點選「分享」→「加入主畫面螢幕」
echo 4. 開啟 Packet app 並配對
echo 5. 開始使用！
echo.
pause
