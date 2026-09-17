"""Geocoding via OpenStreetMap Nominatim (free, no API key needed)."""
import requests
from config import NOMINATIM_USER_AGENT


def search_place(query: str) -> list[dict]:
    """Search for a place by name, return list of results with address + lat/lng."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 5,
        "addressdetails": 1,
        "accept-language": "zh,en",
    }
    headers = {"User-Agent": NOMINATIM_USER_AGENT}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        return [{"error": str(e)}]

    results = []
    for item in data:
        addr = item.get("address", {})
        results.append({
            "name": item.get("display_name", ""),
            "lat": float(item.get("lat", 0)),
            "lng": float(item.get("lon", 0)),
            "address": _format_address(addr),
            "phone": addr.get("phone", ""),
            "website": addr.get("website", ""),
            "type": item.get("type", ""),
            "category": item.get("category", ""),
        })
    return results


def reverse_geocode(lat: float, lng: float) -> dict:
    """Reverse geocode coordinates to get address."""
    url = "https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lng,
        "format": "json",
        "addressdetails": 1,
        "accept-language": "zh,en",
    }
    headers = {"User-Agent": NOMINATIM_USER_AGENT}
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        addr = data.get("address", {})
        return {
            "address": _format_address(addr),
            "lat": float(data.get("lat", 0)),
            "lng": float(data.get("lon", 0)),
        }
    except Exception as e:
        return {"error": str(e)}


def _format_address(addr: dict) -> str:
    """Format address dict into a readable HK-friendly string."""
    parts = []
    # Try HK-specific fields first
    for key in ["building", "amenity", "shop", "road", "street", "block", "subdivision"]:
        val = addr.get(key, "")
        if val:
            parts.append(val)
    # Area
    for key in ["quarter", "neighbourhood", "suburb", "district"]:
        val = addr.get(key, "")
        if val:
            # Skip if already in parts
            if val not in parts:
                parts.append(val)
    # City/region
    for key in ["city", "town", "county"]:
        val = addr.get(key, "")
        if val and val not in parts:
            parts.append(val)
    # Country
    country = addr.get("country", "")
    if country and country not in parts:
        parts.append(country)

    return ", ".join(parts) if parts else ""