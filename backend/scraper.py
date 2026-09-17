"""Parse Instagram/Threads links — lightweight version.
Backend just detects source; oEmbed fetch happens in the browser (avoids network restrictions)."""
import re


def detect_source(url: str) -> str | None:
    """Detect whether the URL is Instagram, Threads, or unknown."""
    url = url.strip().lower()
    if "instagram.com" in url:
        return "instagram"
    if "threads.net" in url:
        return "threads"
    return None


def parse_ig_url(url: str) -> dict:
    """Detect source only. Returns minimal info for frontend to handle parsing."""
    source = detect_source(url)
    if not source:
        return {
            "source": "unknown",
            "suggested_name": "",
            "description": "",
            "image_url": "",
            "parse_error": None,
        }

    # Frontend handles oEmbed fetching (bypasses server network restrictions)
    return {
        "source": source,
        "suggested_name": "",
        "description": "",
        "image_url": "",
        "parse_error": "try_browser",
    }


def _try_oembed(url: str, source: str) -> dict | None:
    """Try server-side oEmbed (may fail on restricted networks)."""
    try:
        import requests
        api_url = (
            f"https://api.instagram.com/oembed?url={url}"
            if source == "instagram"
            else f"https://threads.net/oembed?url={url}"
        )
        resp = requests.get(api_url, timeout=5)
        if resp.status_code != 200:
            return None

        data = resp.json()
        title = data.get("title", "") or ""
        name = _extract_name_from_caption(title)

        return {
            "source": source,
            "suggested_name": name,
            "description": data.get("description") or data.get("author_name", ""),
            "image_url": data.get("thumbnail_url", ""),
            "parse_error": None,
        }
    except Exception:
        return None


def extract_name_from_caption(caption: str) -> str:
    """Extract a restaurant/place name from an Instagram caption.
    Called from frontend when server-side oEmbed fails."""
    return _extract_name_from_caption(caption)


def _extract_name_from_caption(caption: str) -> str:
    """Extract business name from caption text using heuristics."""
    if not caption or len(caption) > 200:
        return ""

    # Strategy 1: Look for 📍 or 🏠 followed by name
    m = re.search(r'[📍📌🏠🏪]\s*([A-Za-z0-9\u4e00-\u9fff\s]{2,40})', caption)
    if m:
        name = m.group(1).strip()
        # Clean up trailing punctuation
        name = re.sub(r'[,\.\s\-]+$', '', name).strip()
        if 2 <= len(name) <= 40:
            return name

    # Strategy 2: Look for "at" or "喺" pattern
    m = re.search(r'(?:at|喺|@)\s+([A-Za-z0-9\u4e00-\u9fff\s]{2,40})', caption, re.IGNORECASE)
    if m:
        name = m.group(1).strip()
        if 2 <= len(name) <= 40 and not name.startswith('@'):
            return name

    # Strategy 3: First line of caption (often has the name)
    lines = caption.split('\n')
    first_line = lines[0].strip()
    if first_line and 2 <= len(first_line) <= 40:
        # Check it doesn't look like "By @username"
        if not first_line.lower().startswith(('by ', 'by @', 'photo by')):
            return first_line

    return ""


def _extract_from_browser_oembed(url: str) -> str:
    """Build the oEmbed URL for the browser to fetch directly."""
    url_lower = url.strip().lower()
    if "instagram.com" in url_lower:
        return f"https://api.instagram.com/oembed?url={url}"
    if "threads.net" in url_lower:
        return f"https://threads.net/oembed?url={url}"
    return ""