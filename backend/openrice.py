"""Search OpenRice for a restaurant by name."""
import requests
import re
from urllib.parse import quote
from config import OPENRICE_SEARCH_URL

USER_AGENT = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)


def search_openrice(name: str) -> dict:
    """Search OpenRice for a restaurant and return the top match."""
    url = OPENRICE_SEARCH_URL.format(quote(name + " Hong Kong"))
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()

        # OpenRice uses JS rendering, so we can't easily scrape it.
        # Instead, we construct the search URL as the OpenRice link.
        # The user can click to open in browser.

        # Try to extract any OpenRice restaurant URL from the page
        openrice_urls = re.findall(
            r'https://www\.openrice\.com/zh/hongkong/r/[^"\']+',
            resp.text,
        )
        if openrice_urls:
            return {
                "url": openrice_urls[0],
                "search_url": url,
                "found": True,
            }

        # Fallback — just return the search URL
        return {
            "url": url,
            "search_url": url,
            "found": False,
        }

    except Exception as e:
        return {
            "url": url,
            "search_url": url,
            "found": False,
            "error": str(e),
        }