#!/bin/bash

# Packet 部署前檢查腳本

echo "🔍 Packet 部署前檢查"
echo "===================="
echo ""

# 1. 檢查環境變數
echo "✓ 檢查環境變數..."
if [ -f .env ]; then
    echo "  ✓ .env 檔案存在"
    
    if grep -q "VITE_SUPABASE_URL=https://cfmswewmfaahthjlkshg.supabase.co" .env; then
        echo "  ✓ Supabase URL 已設定"
    else
        echo "  ✗ Supabase URL 未設定或錯誤"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY=eyJ" .env; then
        echo "  ✓ Supabase Anon Key 已設定"
    else
        echo "  ✗ Supabase Anon Key 未設定"
    fi
else
    echo "  ✗ .env 檔案不存在"
fi

echo ""

# 2. 檢查依賴安裝
echo "✓ 檢查 npm 依賴..."
if [ -d "node_modules" ]; then
    echo "  ✓ node_modules 存在"
else
    echo "  ✗ node_modules 不存在，需要執行 npm install"
fi

echo ""

# 3. 嘗試建置
echo "✓ 測試建置..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "  ✓ 建置成功"
else
    echo "  ✗ 建置失敗，請執行 npm run build 查看錯誤"
fi

echo ""

# 4. 檢查 dist 目錄
echo "✓ 檢查產物..."
if [ -d "dist" ]; then
    echo "  ✓ dist/ 目錄存在"
    
    if [ -f "dist/index.html" ]; then
        echo "  ✓ index.html 已產生"
    fi
    
    if [ -f "dist/sw.js" ]; then
        echo "  ✓ Service Worker 已產生"
    fi
else
    echo "  ✗ dist/ 目錄不存在"
fi

echo ""
echo "===================="
echo "📋 下一步："
echo "1. 確認 Supabase migration 已執行（見 SUPABASE_SETUP.md）"
echo "2. 執行 'vercel --prod' 或 'netlify deploy --prod' 部署"
echo "3. 在 iPhone Safari 開啟部署後的 URL"
echo "4. 加入主畫面螢幕"
echo "5. 開始配對並使用！"
echo ""
