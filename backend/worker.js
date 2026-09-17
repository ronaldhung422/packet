export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');
    if (!target) return new Response('Missing url param', { status: 400 });

    try {
      // Build the embed URL
      const embedUrl = target.replace(/\/?$/, '/embed/');
      
      const resp = await fetch(embedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
        }
      });
      const html = await resp.text();

      // Extract caption from embedded JSON: gql_data.shortcode_media.edge_media_to_caption.edges[0].node.text
      let caption = '';
      let title = '';
      let displayUrl = '';
      let username = '';

      // Find the gql_data JSON blob
      const gqlMatch = html.match(/"gql_data":\s*({[^}]+(?:}[^}]+)*?})/);
      if (gqlMatch) {
        try {
          const gqlData = JSON.parse(gqlMatch[1]);
          const media = gqlData.shortcode_media;
          if (media) {
            const edges = media.edge_media_to_caption?.edges;
            if (edges && edges.length > 0) {
              caption = edges[0].node.text || '';
            }
            displayUrl = media.display_url || media.thumbnail_src || '';
            username = media.owner?.username || '';
          }
        } catch (e) { /* gql parse failed */ }
      }

      // Also try og:title as fallback
      if (!caption) {
        const ogMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (ogMatch) title = ogMatch[1];
        const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (descMatch) caption = descMatch[1];
      }

      // Try to find restaurant/place names from caption
      // Look for patterns like: 📍 Address or specific keywords
      const lines = (caption || '').split('\n').filter(l => l.trim());
      const locationLines = lines.filter(l => l.match(/[📍📌]|地址|尖沙咀|旺角|銅鑼灣|元朗|中環|灣仔|九龍|香港/));
      
      // Extract restaurant name (often the first line or after emoji patterns)
      let suggestedName = '';
      for (const l of lines) {
        const clean = l.replace(/[📍📌#⭐✨🔥]/g, '').trim();
        if (clean.length >= 2 && clean.length <= 30 && 
            !clean.match(/^https?:\/\//) && !clean.startsWith('@') &&
            clean.match(/[\u4e00-\u9fff]/)) {  // Has Chinese chars
          suggestedName = clean;
          break;
        }
      }

      return new Response(JSON.stringify({
        caption,
        title,
        display_url: displayUrl,
        username,
        suggested_name: suggestedName,
        location_lines: locationLines.slice(0, 3),
        lines_count: lines.length,
      }), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }
  }
}