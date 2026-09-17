# Packet 📦

同 Ronald & 女朋友一齊記低 IG/Threads 見到嘅餐廳同好去處。

## 點樣用

### iPhone 連接（🔀 方案 B：Render.com）

之後 deploy 上 Render 就有固定 URL，隨時隨地用。

### 本地開發

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Safari 開 `http://localhost:5678`

## 功能一覽

| 功能 | 說明 |
|------|------|
| 📋 列表 | 睇晒所有 saved places，篩選分類、搜尋 |
| 🗺️ 地圖 | 地圖模式睇晒所有地點位置 |
| 📊 統計 | 睇分類分佈、總數 |
| 💭 回憶 | 每個地方可以寫低回憶 |
| ⭐ 評分 | 1-5 星評分 |
| 🔗 OpenRice | 自動搵 OpenRice 食評連結 |
| 📱 PWA | 加去 Home Screen 似真 App |

## Architecture

```
iPhone (Safari PWA)
    │
    ▼  HTTP requests
Python Flask Backend (port 5678)
    │
    ├── IG/Threads Link Parser
    ├── OpenStreetMap Geocoder (免費)
    ├── OpenRice Search
    └── PostgreSQL / SQLite Database
```