/* ── Packet — 主 App ── */
const app = {
  currentTab: "list",
  categories: [],
  places: [],
  currentPlace: null,

  // ── Init ──
  async init() {
    await this.loadCategories();
    this.showTab("list");
    this.loadList();
    this.registerSW();
  },

  registerSW() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  },

  // ── Toast ──
  toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2500);
  },

  // ── Tab navigation ──
  showTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));

    document.getElementById(`screen-${tab}`).classList.add("active");
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

    if (tab === "list") this.loadList();
    if (tab === "map") this.loadMap();
    if (tab === "stats") this.loadStats();
  },

  // ── Load categories ──
  async loadCategories() {
    const data = await API.listCategories();
    this.categories = data.categories || [];
    this.renderCategoryPills();
    this.renderCategorySelect();
  },

  renderCategoryPills() {
    const el = document.getElementById("cat-pills");
    if (!el) return;
    let html = `<button class="cat-pill active" data-cat="" onclick="app.filterByCategory('')">全部</button>`;
    this.categories.forEach((c) => {
      html += `<button class="cat-pill" data-cat="${c.id}" onclick="app.filterByCategory(${c.id})" style="border-color:${c.color}">${c.icon} ${c.name}</button>`;
    });
    el.innerHTML = html;
  },

  renderCategorySelect() {
    const selects = document.querySelectorAll(".cat-select");
    selects.forEach((sel) => {
      sel.innerHTML = `<option value="">無分類</option>`;
      this.categories.forEach((c) => {
        sel.innerHTML += `<option value="${c.id}">${c.icon} ${c.name}</option>`;
      });
    });
  },

  currentFilter: "",

  filterByCategory(catId) {
    this.currentFilter = catId;
    document.querySelectorAll(".cat-pill").forEach((p) => {
      p.classList.toggle("active", p.dataset.cat == catId);
    });
    this.loadList();
  },

  // ── List screen ──
  async loadList() {
    const el = document.getElementById("place-list");
    if (!el) return;

    const params = {};
    if (this.currentFilter) params.category_id = this.currentFilter;
    const search = document.getElementById("list-search")?.value?.trim();
    if (search) params.search = search;

    const data = await API.listPlaces(params);
    this.places = data.places || [];

    if (this.places.length === 0) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📍</div>
          <h3>未有紀錄</h3>
          <p style="font-size:13px;color:var(--text3);">去 IG/Threads 見到好嘢就 Save 低啦</p>
          <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="app.showTab('add')">➕ 加新地點</button>
        </div>
      `;
      return;
    }

    let html = "";
    this.places.forEach((p) => {
      const stars = "⭐".repeat(p.rating || 0);
      html += `
        <div class="card" onclick="app.viewPlace(${p.id})">
          <div class="card-actions">
            <button class="btn-icon" onclick="event.stopPropagation();app.deletePlace(${p.id})">🗑️</button>
          </div>
          <div class="card-title">${p.name}</div>
          <div class="card-sub">
            ${p.category_name
              ? `<span class="card-tag" style="background:${p.category_color || "#666"}">${p.category_icon || ""} ${p.category_name}</span>`
              : ""}
            ${p.rating ? `<span class="rating">${stars}</span>` : ""}
          </div>
          <div class="card-meta">
            ${p.address ? `<span>📍 ${p.address}</span>` : ""}
            ${p.source_url ? `<span>🔗 from ${p.source}</span>` : ""}
            <span style="margin-left:auto;">${new Date(p.created_at).toLocaleDateString("zh-HK")}</span>
          </div>
        </div>
      `;
    });
    el.innerHTML = html;
  },

  // ── Add screen ──
  async parseLink() {
    const url = document.getElementById("add-url").value.trim();
    if (!url) {
      this.toast("請先貼上 IG / Threads 連結");
      return;
    }

    document.getElementById("parse-result").innerHTML = '<div class="spinner"></div><p style="text-align:center;color:var(--text3);font-size:12px;">解析中...</p>';

    // Step 1: Quick backend detect (source type) with Safari-safe timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let data;
    try {
      const resp = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      data = await resp.json();
    } catch (e) {
      this._showParseFallback(url);
      return;
    } finally {
      clearTimeout(timeoutId);
    }

    if (data.suggested_name) {
      this._fillParsedData(data, url);
      return;
    }

    // Step 2: Try browser-side oEmbed (fast, 2 CORS proxies in parallel)
    if (data.parse_error === "try_browser" && data.source) {
      const name = await this._browserOEmbed(url, data.source);
      if (name) {
        this._fillParsedData({ suggested_name: name, source: data.source, image_url: "" }, url);
        return;
      }
    }

    // Step 3: Failed
    this._showParseFallback(url);
  },

  async _browserOEmbed(url, source) {
    const oembedUrl = source === "instagram"
      ? `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`
      : `https://threads.net/oembed?url=${encodeURIComponent(url)}`;

    const CF_WORKER = "https://packetproxy.packet-proxy.workers.dev";

    const proxies = [
      `${CF_WORKER}?url=${encodeURIComponent(oembedUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(oembedUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(oembedUrl)}`,
    ];

    const results = await Promise.race([
      Promise.allSettled(
        proxies.map(proxyUrl =>
          fetch(proxyUrl, { signal: _signal(5000) })
            .then(r => r.ok ? r.text() : null)
            .then(text => text ? _parseJson(text) : null)
        )
      ),
      _delay(7000).then(() => null),
    ]);

    if (!results) return "";

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        const name = _extractName(r.value.title || r.value.author_name || "");
        if (name) return name;
      }
    }
    return "";
  },

  _showParseFallback(url) {
    document.getElementById("parse-result").innerHTML = `
      <div class="parse-result">
        <span style="color:var(--accent);">⚠️ 無法自動偵測餐廳名</span>
        <div class="parse-label" style="margin-top:4px;">連結已儲存 🎯 打個名就 OK</div>
      </div>
    `;
    document.getElementById("add-url-store").value = url;
  },

  _fillParsedData(data, url) {
    if (data.suggested_name) {
      document.getElementById("add-name").value = data.suggested_name;
      this.autoGeocode(data.suggested_name);
    }
    if (data.description) {
      document.getElementById("add-notes").value = data.description;
    }
    document.getElementById("add-source").value = data.source || "manual";
    document.getElementById("add-url-store").value = url;

    document.getElementById("parse-result").innerHTML = `
      <div class="parse-result">
        <div class="parse-label">來源</div>
        <div class="parse-val">${data.source || "未知"}</div>
        <div class="parse-label">建議名稱</div>
        <div class="parse-val">${data.suggested_name || "（未能自動偵測）"}</div>
        ${data.image_url ? `<img src="${data.image_url}" style="width:100%;border-radius:8px;margin-top:6px;" referrerpolicy="no-referrer">` : ""}
      </div>
    `;
    this.toast("✅ 已偵測到餐廳名！");
  },

  async autoGeocode(name) {
    const results = await API.geocode(name + " Hong Kong");
    const items = results.results || [];
    if (items.length > 0 && !items[0].error) {
      const item = items[0];
      document.getElementById("add-address").value = item.address || "";
      document.getElementById("add-lat").value = item.lat || "";
      document.getElementById("add-lng").value = item.lng || "";
      document.getElementById("add-phone").value = item.phone || "";
      this.toast(`📍 已搵到地址：${item.address}`);
    }
  },

  async searchGeocode() {
    const name = document.getElementById("add-name").value.trim();
    if (!name) {
      this.toast("請先輸入名稱");
      return;
    }
    this.autoGeocode(name);
  },

  async searchOpenRiceSuggest() {
    const name = document.getElementById("add-name").value.trim();
    if (!name) return;
    const data = await API.searchOpenRice(name);
    if (data.url) {
      document.getElementById("add-openrice").value = data.url;
      this.toast("🔗 已搵到 OpenRice 連結！");
    }
  },

  async savePlace() {
    const name = document.getElementById("add-name").value.trim();
    if (!name) {
      this.toast("請輸入名稱");
      return;
    }

    const data = {
      name,
      source_url: document.getElementById("add-url-store").value || "",
      source: document.getElementById("add-source").value || "manual",
      address: document.getElementById("add-address").value.trim(),
      lat: parseFloat(document.getElementById("add-lat").value) || null,
      lng: parseFloat(document.getElementById("add-lng").value) || null,
      phone: document.getElementById("add-phone").value.trim(),
      openrice_url: document.getElementById("add-openrice").value.trim(),
      notes: document.getElementById("add-notes").value.trim(),
      category_id: parseInt(document.getElementById("add-category").value) || null,
      rating: parseInt(document.getElementById("add-rating").value) || 0,
    };

    const result = await API.createPlace(data);
    if (result.error) {
      this.toast(`❌ ${result.error}`);
      return;
    }
    this.toast(result.message || "✅ 已儲存！");
    this.clearAddForm();
    this.showTab("list");
  },

  clearAddForm() {
    ["add-url", "add-name", "add-address", "add-lat", "add-lng",
     "add-phone", "add-openrice", "add-notes", "add-url-store", "add-source"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
    document.getElementById("add-rating").value = "0";
    document.getElementById("add-category").value = "";
    document.getElementById("parse-result").innerHTML = "";
  },

  // ── Detail view (modal sheet) ──
  async viewPlace(id) {
    const data = await API.getPlace(id);
    if (!data.place) {
      this.toast("❌ 搵唔到呢個記錄");
      return;
    }
    this.currentPlace = data.place;
    const p = data.place;
    const stars = "⭐".repeat(p.rating || 0);

    const memoriesHtml = (p.memories || []).map(
      (m) => `
        <div class="memory-item">
          <div>💭 ${m.text}</div>
          <div class="memory-time">${new Date(m.created_at).toLocaleDateString("zh-HK")}
            <button class="btn-icon" onclick="event.stopPropagation();app.deleteMemory(${p.id},${m.id})" style="float:right;font-size:12px;">🗑️</button>
          </div>
        </div>
      `
    ).join("");

    document.getElementById("modal-content").innerHTML = `
      <div class="detail-header">
        <div class="detail-name">${p.name}</div>
        ${p.category_name ? `<span class="detail-cat-tag" style="background:${p.category_color || "#666"}">${p.category_icon || ""} ${p.category_name}</span>` : ""}
        ${stars ? `<span class="rating" style="margin-left:8px;">${stars}</span>` : ""}
      </div>

      <div class="detail-info">
        ${p.address ? `<div class="detail-info-row"><span class="info-icon">📍</span><span>${p.address}</span></div>` : ""}
        ${p.phone ? `<div class="detail-info-row"><span class="info-icon">📞</span><span>${p.phone}</span></div>` : ""}
        ${p.openrice_url ? `<div class="detail-info-row"><span class="info-icon">🍚</span><a href="${p.openrice_url}" target="_blank">OpenRice 睇食評 →</a></div>` : ""}
        ${p.source_url ? `<div class="detail-info-row"><span class="info-icon">🔗</span><a href="${p.source_url}" target="_blank">原帖連結</a></div>` : ""}
        ${p.notes ? `<div class="detail-info-row"><span class="info-icon">📝</span><span>${p.notes}</span></div>` : ""}
        ${p.created_by ? `<div class="detail-info-row"><span class="info-icon">👤</span><span>由 ${p.created_by} 記錄</span></div>` : ""}
      </div>

      ${p.lat && p.lng ? `<button class="btn btn-outline btn-sm btn-full" onclick="app.showOnMap(${p.lat},${p.lng},'${p.name}')">🗺️ 睇地圖</button><br><br>` : ""}

      <h4 style="margin-bottom:8px;color:var(--text2);">💭 回憶</h4>
      <div class="detail-memories">
        ${memoriesHtml || '<div style="color:var(--text3);font-size:13px;">未有回憶 — 加返個回憶啦 😊</div>'}
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <input id="memory-input" class="form-input" placeholder="寫低你哋嘅回憶..." style="flex:1;">
        <button class="btn btn-primary btn-sm" onclick="app.addMemory(${p.id})">儲存</button>
      </div>

      <hr style="border:0;border-top:1px solid var(--surface2);margin:16px 0;">

      <button class="btn btn-danger btn-full" onclick="app.deletePlace(${p.id})">🗑️ 刪除呢個記錄</button>
    `;

    document.getElementById("detail-modal").classList.add("show");
  },

  closeDetail() {
    document.getElementById("detail-modal").classList.remove("show");
    this.currentPlace = null;
  },

  async addMemory(placeId) {
    const input = document.getElementById("memory-input");
    const text = input.value.trim();
    if (!text) {
      this.toast("請輸入回憶內容");
      return;
    }
    await API.addMemory(placeId, text);
    input.value = "";
    this.toast("💭 回憶已儲存！");
    this.viewPlace(placeId);
  },

  async deleteMemory(placeId, memoryId) {
    if (!confirm("刪除呢段回憶？")) return;
    await API.deleteMemory(placeId, memoryId);
    this.toast("已刪除回憶");
    this.viewPlace(placeId);
  },

  async deletePlace(id) {
    const p = this.places.find((pl) => pl.id === id) || this.currentPlace;
    if (!p || !confirm(`刪除「${p.name}」？`)) return;
    await API.deletePlace(id);
    this.toast(`已刪除 ${p.name}`);
    this.closeDetail();
    this.loadList();
  },

  showOnMap(lat, lng, name) {
    this.closeDetail();
    this.showTab("map");
    setTimeout(() => focusPlaceOnMap(lat, lng), 300);
  },

  // ── Map screen ──
  async loadMap() {
    const container = document.getElementById("map-container");
    if (!container) return;
    await initMap("map-container");
    await loadMapMarkers();
  },

  // ── Stats screen ──
  async loadStats() {
    const data = await API.getStats();
    const el = document.getElementById("stats-content");
    if (!el) return;

    const catRows = (data.by_category || []).map(
      (c) => `
        <div class="cat-stat-row">
          <span>${c.icon || ""}</span>
          <span style="flex:1;">${c.name}</span>
          <span style="font-weight:600;">${c.count}</span>
          <span style="width:${Math.min(c.count * 30, 100)}px;height:6px;background:${c.color || "#666"};border-radius:3px;"></span>
        </div>
      `
    ).join("");

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-num">${data.total_places}</div>
          <div class="stat-label">已儲存 🏠</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${data.total_memories}</div>
          <div class="stat-label">回憶 💭</div>
        </div>
      </div>
      <h4 style="color:var(--text2);margin-bottom:8px;">分類統計</h4>
      <div class="cat-stats">${catRows || '<div style="color:var(--text3);">未有資料</div>'}</div>
    `;
  },
};

// ── Standalone helpers (Safari-compatible) ──
function _signal(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function _parseJson(text) {
  try { return JSON.parse(text); } catch (e) { return null; }
}
function _extractName(text) {
  if (!text) return "";
  const patterns = [
    /[📍📌🏠🏪]\s*([A-Za-z0-9\u4e00-\u9fff\s]{2,40})/,
    /(?:at|喺|@)\s+([A-Za-z0-9\u4e00-\u9fff\s]{2,40})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      let name = m[1].trim().replace(/[,.\s\-]+$/g, "").trim();
      if (name.length >= 2 && name.length <= 40 && !name.startsWith("@")) return name;
    }
  }
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    const first = lines[0];
    if (first.length >= 2 && first.length <= 40 && !first.toLowerCase().startsWith("by ") && !first.startsWith("@")) return first;
  }
  return "";
}

// ── Init on load ──
document.addEventListener("DOMContentLoaded", () => app.init());