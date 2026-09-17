"""Parse Instagram/Threads links — lightweight version for restricted networks.
Detects source, stores URL. Name input is manual (fastest & most reliable)."""
import re


def detect_source(url: str) -> str | None:
    """Detect whether the URL is Instagram, Threads, or unknown, and extract info."""
    url = url.strip().lower()
    if "instagram.com" in url:
        return "instagram"
    if "threads.net" in url:
        return "threads"
    return None


def parse_ig_url(url: str) -> dict:
    """Detect source only — doesn't fetch content (avoids network restrictions).
    Returns the source type for the frontend to store the link."""
    source = detect_source(url)
    if not source:
        return {
            "source": "unknown",
            "suggested_name": "",
            "description": "",
            "image_url": "",
            "parse_error": None,
        }

    # Try oEmbed API (some hosts allow it)
    result = _try_oembed(url, source)
    if result:
        return result

    # oEmbed didn't work — return source only, user fills name manually
    return {
        "source": source,
        "suggested_name": "",
        "description": "",
        "image_url": "",
        "parse_error": "自動偵測唔到內容，請手動輸入餐廳名 😊",
    }


def _try_oembed(url: str, source: str) -> dict | None:
    """Try oEmbed API — returns result dict on success, None on failure."""
    import requests

    api_url = (
        f"https://api.instagram.com/oembed?url={url}"
        if source == "instagram"
        else f"https://threads.net/oembed?url={url}"
    )

    try:
        resp = requests.get(api_url, timeout=5)
        if resp.status_code != 200:
            return None

        data = resp.json()
        title = data.get("title", "") or ""
        # Clean title to get name
        name = re.sub(
            r"\s*(on Instagram|• Instagram|• Threads|\|.*)$",
            "", title, flags=re.IGNORECASE,
        ).strip()

        return {
            "source": source,
            "suggested_name": name if len(name) < 40 else "",
            "description": data.get("description") or data.get("author_name", ""),
            "image_url": data.get("thumbnail_url", ""),
            "parse_error": None,
        }
    except Exception:
        return None