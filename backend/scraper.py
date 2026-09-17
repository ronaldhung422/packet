"""Parse Instagram/Threads links to extract useful info."""
import re
import requests
from bs4 import BeautifulSoup
import json

USER_AGENT = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)


def detect_source(url: str) -> str | None:
    """Detect whether the URL is Instagram, Threads, or unknown."""
    url = url.strip().lower()
    if "instagram.com" in url:
        return "instagram"
    if "threads.net" in url:
        return "threads"
    return None


def fetch_page_meta(url: str) -> dict:
    """Fetch a page and extract meta tags + title."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-HK,zh;q=0.9,en;q=0.8",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        return {"error": str(e), "title": "", "description": "", "text": ""}

    soup = BeautifulSoup(resp.text, "html.parser")

    title = ""
    description = ""
    og_title = ""
    og_description = ""
    og_image = ""

    # Title
    if soup.title and soup.title.string:
        title = soup.title.string.strip()

    # OG tags
    for tag in soup.find_all("meta"):
        prop = tag.get("property", "") or tag.get("name", "")
        content = tag.get("content", "")
        if prop in ("og:title", "twitter:title"):
            og_title = content
        elif prop in ("og:description", "twitter:description"):
            og_description = content
        elif prop in ("og:image", "twitter:image"):
            og_image = content

    # Meta description
    desc_tag = soup.find("meta", attrs={"name": "description"})
    if desc_tag:
        description = desc_tag.get("content", "")

    # Page text (first few paragraphs)
    text_parts = []
    for p in soup.find_all("p"):
        t = p.get_text(strip=True)
        if t and len(t) > 10:
            text_parts.append(t)

    return {
        "title": og_title or title,
        "description": og_description or description,
        "og_image": og_image,
        "page_text": " ".join(text_parts[:5]),
    }


def extract_place_name(meta: dict) -> str | None:
    """Try to extract a place/restaurant name from page meta."""
    candidates = []

    # Check title — often has restaurant name
    title = meta.get("title", "")
    if title:
        # Remove common suffixes
        cleaned = re.sub(
            r"\s*(on Instagram|• Instagram|• Threads|·\s*Instagram|·\s*Threads|\|.*)$",
            "",
            title,
            flags=re.IGNORECASE,
        ).strip()
        cleaned = re.sub(r"^(@\w+\s*)", "", cleaned).strip()
        if cleaned and len(cleaned) < 60:
            candidates.append(cleaned)

    # Check description
    desc = meta.get("description", "")
    if desc:
        # Often contains @mention and place description
        lines = desc.split("\n")
        for line in lines:
            line = line.strip()
            if line and len(line) < 50 and not line.startswith("@"):
                # Skip pure location lines
                if not re.match(r"^(Hong Kong|香港|Central|Causeway Bay|Tsim Sha Tsui|Mong Kok)", line, re.IGNORECASE):
                    candidates.append(line)

    # Check page text for location-like patterns
    text = meta.get("page_text", "")
    if text:
        # Look for patterns like "📍 豚王" or "Location: 豚王"
        loc_match = re.search(r"[📍📌🗺️]\s*(.{2,30})", text)
        if loc_match:
            candidates.append(loc_match.group(1).strip())

    return candidates[0] if candidates else None


def parse_ig_url(url: str) -> dict:
    """Parse an Instagram/Threads URL and extract useful info."""
    source = detect_source(url)
    if not source:
        return {
            "source": "unknown",
            "title": "",
            "suggested_name": "",
            "description": "",
            "image_url": "",
        }

    meta = fetch_page_meta(url)
    suggested_name = extract_place_name(meta)

    return {
        "source": source,
        "title": meta.get("title", ""),
        "suggested_name": suggested_name or "",
        "description": meta.get("description", ""),
        "image_url": meta.get("og_image", ""),
        "parse_error": meta.get("error"),
    }