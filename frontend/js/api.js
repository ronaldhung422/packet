/* ── API layer for Packet ── */

const API_BASE = ""; // Same origin

async function api(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  return res.json();
}

const API = {
  // Parse IG/Threads link
  parseLink: (url) => api("POST", "/api/parse", { url }),

  // Geocode
  geocode: (query) => api("POST", "/api/geocode", { query }),
  reverseGeocode: (lat, lng) => api("POST", "/api/reverse-geocode", { lat, lng }),

  // OpenRice
  searchOpenRice: (name) => api("POST", "/api/openrice", { name }),

  // Places CRUD
  listPlaces: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api("GET", `/api/places?${qs}`);
  },
  getPlace: (id) => api("GET", `/api/places/${id}`),
  createPlace: (data) => api("POST", "/api/places", data),
  updatePlace: (id, data) => api("PUT", `/api/places/${id}`, data),
  deletePlace: (id) => api("DELETE", `/api/places/${id}`),

  // Memories
  addMemory: (placeId, text) => api("POST", `/api/places/${placeId}/memories`, { text }),
  deleteMemory: (placeId, memoryId) =>
    api("DELETE", `/api/places/${placeId}/memories/${memoryId}`),

  // Categories
  listCategories: () => api("GET", "/api/categories"),
  createCategory: (data) => api("POST", "/api/categories", data),
  deleteCategory: (id) => api("DELETE", `/api/categories/${id}`),

  // Map
  getMapData: () => api("GET", "/api/map-data"),

  // Stats
  getStats: () => api("GET", "/api/stats"),
};