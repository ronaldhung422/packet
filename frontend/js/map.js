/* ── Leaflet Map for Packet ── */
let mapInstance = null;
let mapMarkers = [];

async function initMap(containerId) {
  if (mapInstance) {
    mapInstance.invalidateSize();
    return mapInstance;
  }

  // Wait for Leaflet to load
  if (!window.L) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  mapInstance = L.map(containerId, {
    center: [22.3193, 114.1694], // Hong Kong
    zoom: 12,
    zoomControl: true,
    attributionControl: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(mapInstance);

  return mapInstance;
}

async function loadMapMarkers() {
  if (!mapInstance) return;

  // Clear existing markers
  mapMarkers.forEach((m) => mapInstance.removeLayer(m));
  mapMarkers = [];

  const data = await API.getMapData();
  const places = data.places || [];

  if (places.length === 0) {
    // Show a friendly message on the map
    return;
  }

  const bounds = [];

  places.forEach((p) => {
    if (!p.lat || !p.lng) return;
    bounds.push([p.lat, p.lng]);

    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 8,
      fillColor: p.category_color || "#6c63ff",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(mapInstance);

    const popupContent = `
      <div style="font-size:13px;max-width:200px;">
        <strong>${p.name}</strong>
        <div style="color:#888;font-size:11px;margin-top:2px;">${p.address || ""}</div>
        <div style="margin-top:4px;">
          <span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:11px;color:#fff;background:${p.category_color || "#666"}">${p.category_icon || ""} ${p.category_name || ""}</span>
        </div>
        <button onclick="app.viewPlace(${p.id})" style="margin-top:6px;padding:4px 10px;background:#6c63ff;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer;">睇詳情 →</button>
      </div>
    `;
    marker.bindPopup(popupContent);
    mapMarkers.push(marker);
  });

  if (bounds.length > 0) {
    mapInstance.fitBounds(bounds, { padding: [30, 30] });
  }
}

function focusPlaceOnMap(lat, lng) {
  if (!mapInstance) return;
  mapInstance.setView([lat, lng], 15, { animate: true });
}