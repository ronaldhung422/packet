# 🔍 白屏問題診斷指南

## 當前狀態
- ✅ 建置成功（TypeScript 編譯通過）
- ✅ 開發伺服器運行中 (http://localhost:3000)
- ✅ 預覽伺服器運行中 (http://localhost:4173)
- ✅ JS 和 CSS 檔案都已正確產生

## 診斷步驟

### 1. 開啟瀏覽器開發者工具

1. 打開 Chrome 或 Edge 瀏覽器
2. 前往 http://localhost:3000 (開發版) 或 http://localhost:4173 (正式版)
3. 按 F12 打開開發者工具
4. 切換到 **Console** 標籤

### 2. 檢查 Console 錯誤

查看是否有以下類型的錯誤：

#### A. 模組載入錯誤
```
Failed to load module
Cannot find module
```
**解決方式：** 檢查導入路徑是否正確

#### B. React 錯誤
```
Cannot read property 'xxx' of undefined
Objects are not valid as a React child
```
**解決方式：** 檢查元件是否正確渲染

#### C. Store 初始化錯誤
```
useStore is not a function
Cannot access 'xxx' before initialization
```
**解決方式：** 檢查 Zustand store 設定

#### D. i18n 錯誤
```
Cannot read property 't' of undefined
i18n is not defined
```
**解決方式：** 這可能是中文化時導入的問題

### 3. 檢查 Network 標籤

1. 切換到 **Network** 標籤
2. 重新載入頁面 (Ctrl+R)
3. 檢查是否有紅色（失敗）的請求
4. 特別注意：
   - index.html (應該是 200)
   - index-xxx.js (應該是 200)
   - index-xxx.css (應該是 200)

### 4. 檢查 Elements 標籤

1. 切換到 **Elements** 標籤
2. 查看 `<div id="root"></div>` 裡面是否有內容
3. 如果是空的 → JavaScript 錯誤
4. 如果有內容但不可見 → CSS 問題

## 快速修復方案

### 方案 A：回退中文化（最可能的問題）

如果是 i18n 導入的問題，先移除中文化：

```bash
# 移除 i18n 導入
# 在 Navigation.tsx 中移除 'import i18n from '../i18n''
# 恢復原始的英文標籤
```

### 方案 B：清除快取重新建置

```bash
# 停止所有伺服器
taskkill /F /IM node.exe

# 清除快取
rd /s /q node_modules\.vite
rd /s /q dist

# 重新建置
npm run build

# 啟動預覽
npm run preview
```

### 方案 C：檢查瀏覽器相容性

- 確保使用最新版的 Chrome、Edge 或 Safari
- 不要使用 IE 瀏覽器

## 最可能的問題

根據我們剛才的修改，最可能是以下原因：

### 1. i18n 模組導入問題

Navigation.tsx 導入了 i18n，但可能：
- 導入路徑錯誤
- i18n 模組執行時錯誤
- zh-TW.ts 中的 export 有問題

**測試方式：**
打開 Console 輸入：
```javascript
import('../src/i18n/index').then(m => console.log(m))
```

### 2. Zustand store 初始化問題

可能在 initializeApp() 時出錯

**測試方式：**
打開 Console 輸入：
```javascript
localStorage.getItem('packet-store')
```

### 3. Service Worker 衝突

舊的 service worker 可能快取了舊版本

**解決方式：**
1. 開啟開發者工具 → Application 標籤
2. 左側選擇 Service Workers
3. 點選 Unregister 移除所有 service workers
4. 重新載入頁面

## 回報資訊

如果以上都無法解決，請回報以下資訊：

1. **Console 中的錯誤訊息**（完整複製）
2. **Network 標籤中失敗的請求**
3. **瀏覽器版本**

## 緊急回退方案

如果需要立即恢復正常運作：

```bash
# 回到上一個成功的版本
git log --oneline
git checkout <之前成功的 commit>
npm run build
npm run preview
```

---

## 下一步

請依照以上步驟診斷，並告訴我 Console 中看到的錯誤訊息，我會幫你修正。
