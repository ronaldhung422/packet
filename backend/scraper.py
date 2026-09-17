"""Parse Instagram/Threads links via oEmbed API (fast, structured JSON)."""
import re
import requests

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


def parse_ig_url(url: str) -> dict:
    """Parse an Instagram/Threads URL using oEmbed API (fast)."""
    source = detect_source(url)
    if not source:
        return {
            "source": "unknown",
            "suggested_name": "",
            "description": "",
            "image_url": "",
        }

    result = {
        "source": source,
        "title": "",
        "suggested_name": "",
        "description": "",
        "image_url": "",
        "parse_error": None,
    }

    # Try oEmbed API first (fast, structured JSON)
    oembed_url = _get_oembed_url(source, url)
    if oembed_url:
        try:
            resp = requests.get(oembed_url, headers={
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
            }, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                result["title"] = data.get("title", "")
                result["description"] = data.get("description") or data.get("author_name", "")
                result["image_url"] = data.get("thumbnail_url", "")
                # Extract name from title
                result["suggested_name"] = _extract_name_from_oembed(data)
                return result
        except Exception as e:
            result["parse_error"] = f"oEmbed failed: {str(e)}"

    # Fallback: basic HTML parsing (last resort)
    meta = _fetch_page_meta(url)
    if meta.get("title"):
        result["title"] = meta["title"]
        result["suggested_name"] = _clean_title(meta["title"])
        result["description"] = meta.get("description", "")
        result["image_url"] = meta.get("og_image", "")
        return result

    # Nothing worked
    result["parse_error"] = "無法自動偵測內容，請手動輸入餐廳名"
    return result


def _get_oembed_url(source: str, url: str) -> str | None:
    """Get the oEmbed API endpoint for the source."""
    if source == "instagram":
        # Instagram oEmbed (public, no token needed for basic info)
        return f"https://api.instagram.com/oembed?url={url}"
    elif source == "threads":
        # Threads oEmbed
        return f"https://threads.net/oembed?url={url}"
    return None


def _extract_name_from_oembed(data: dict) -> str:
    """Extract a place/restaurant name from oEmbed data."""
    title = data.get("title", "") or ""
    author = data.get("author_name", "") or ""

    # Try the title first
    cleaned = _clean_title(title)
    if cleaned and len(cleaned) < 40:
        return cleaned

    # Fall back to author name
    if author and len(author) < 30:
        return author

    return ""


def _clean_title(title: str) -> str:
    """Clean a title string to extract the main name."""
    if not title:
        return ""

    # Remove common prefixes/suffixes
    cleaned = re.sub(
        r"\s*(on Instagram|• Instagram|• Threads|·\s*Instagram|·\s*Threads|\|.*)$",
        "",
        title,
        flags=re.IGNORECASE,
    ).strip()
    cleaned = re.sub(r"^(@\w+\s*)", "", cleaned).strip()

    # Remove " on Threads" etc
    cleaned = re.sub(r"\s+on\s+(Instagram|Threads)$", "", cleaned, flags=re.IGNORECASE).strip()

    return cleaned


def _fetch_page_meta(url: str) -> dict:
    """Fallback: fetch page HTML for meta tags."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-HK,zh;q=0.9,en;q=0.8",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        return {"title": "", "description": "", "og_image": "", "error": str(e)}

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(resp.text, "html.parser")

    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    og_title = ""
    og_description = ""
    og_image = ""

    for tag in soup.find_all("meta"):
        prop = tag.get("property", "") or tag.get("name", "")
        content = tag.get("content", "")
        if prop in ("og:title", "twitter:title"):
            og_title = content
        elif prop in ("og:description", "twitter:description"):
            og_description = content
        elif prop in ("og:image", "twitter:image"):
            og_image = content

    desc_tag = soup.find("meta", attrs={"name": "description"})
    description = desc_tag.get("content", "") if desc_tag else ""

    return {
        "title": og_title or title,
        "description": og_description or description,
        "og_image": og_image,
    }