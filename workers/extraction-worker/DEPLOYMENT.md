# Instagram/Threads Extraction Worker

A Cloudflare Worker for extracting restaurant information from Instagram and Threads links.

## Why We Need This

Instagram's official API no longer provides public post metadata. This worker uses:
1. **Server-side scraping** (bypasses CORS limitations)
2. **Caching** (reduces Instagram rate limiting)
3. **Meta tag parsing** (extracts OpenGraph data)
4. **Pattern matching** (identifies restaurant names)

## Deployment

### Prerequisites

1. Cloudflare account
2. Wrangler CLI installed: `npm install -g wrangler`
3. Node.js 18+

### Steps

1. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

2. **Create KV namespace (for caching)**
   ```bash
   wrangler kv:namespace create "EXTRACTION_CACHE"
   ```
   Update `wrangler.toml` with the returned IDs.

3. **Configure domain (optional)**
   ```bash
   wrangler route create extraction.packet.yourdomain.com/* --zone-id your-zone-id
   ```

4. **Deploy the worker**
   ```bash
   cd workers/extraction-worker
   wrangler deploy
   ```

5. **Test the worker**
   ```bash
   curl -X POST https://packet-extraction-worker.your-subdomain.workers.dev \
     -H "Content-Type: application/json" \
     -d '{"url":"https://www.instagram.com/p/Csample/"}'
   ```

## Configuration

### Environment Variables

Set in Cloudflare dashboard or `wrangler.toml`:

- `EXTRACTION_CACHE_TTL`: Cache duration in seconds (default: 3600)
- `MAX_BODY_SIZE`: Maximum HTML size to parse (default: 1MB)

### CORS Configuration

The worker is configured to allow:
- All origins (for development)
- POST and OPTIONS methods
- Content-Type header

For production, restrict origins:
```javascript
const allowedOrigins = [
  'https://your-app-domain.com',
  'https://packet-app.vercel.app'
]
```

## How It Works

### 1. Request Flow
```
Client → POST {url, platform} → Worker → Instagram/Threads → Parse HTML → Return JSON
```

### 2. Caching Strategy
- **Memory cache**: Worker memory (short-term)
- **KV cache**: Cloudflare KV (1 hour TTL)
- **Browser cache**: Client-side localStorage

### 3. Extraction Process
1. Fetch the Instagram/Threads page with mobile user agent
2. Parse HTML for OpenGraph meta tags
3. Extract restaurant name using pattern matching
4. Cache successful extractions
5. Return structured metadata

## Rate Limiting Considerations

Instagram may block requests if:
- Too many requests from same IP
- Non-standard user agents
- Rapid consecutive requests

### Mitigations:
1. **Caching**: Reduces duplicate requests
2. **Delay**: Add 1-2 second delay between requests
3. **Fallback**: Client-side extraction as backup
4. **Rotation**: Multiple worker instances (if needed)

## Testing

### Valid Test URLs
- Instagram: `https://www.instagram.com/p/Csample123/`
- Instagram Reel: `https://www.instagram.com/reel/Csample456/`
- Threads: `https://www.threads.net/@username/post/123456789`

### Invalid URLs
- Instagram profile: `https://www.instagram.com/username/`
- Instagram story: `https://www.instagram.com/stories/username/`
- Private posts (will fail)

## Monitoring

### Cloudflare Analytics
- Request count
- Cache hit rate
- Error rate
- Response time

### Custom Metrics
```javascript
// In worker code
await fetch('https://api.monitoring.service.com/metrics', {
  method: 'POST',
  body: JSON.stringify({
    extraction_success: successCount,
    extraction_failure: failureCount,
    cache_hits: cacheHits
  })
})
```

## Troubleshooting

### Common Issues

1. **429 Too Many Requests**
   ```bash
   # Solution: Increase cache TTL
   EXTRACTION_CACHE_TTL = "7200"  # 2 hours
   ```

2. **403 Forbidden**
   ```bash
   # Solution: Update user agent
   User-Agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0...'
   ```

3. **Empty Restaurant Name**
   ```bash
   # Solution: Improve pattern matching
   # Check worker logs for HTML structure changes
   ```

4. **CORS Errors**
   ```bash
   # Solution: Verify allowed origins
   Access-Control-Allow-Origin: https://your-app.com
   ```

### Logging
```javascript
// Enable detailed logging
console.log('Extraction details:', {
  url,
  platform,
  titleLength: title?.length,
  descriptionLength: description?.length
})
```

## Cost Estimation

### Cloudflare Workers Pricing
- **Free tier**: 100,000 requests/day
- **Paid**: $0.15 per million requests

### KV Storage Pricing
- **Free tier**: 1GB storage, 1 million reads/day
- **Paid**: $0.50 per GB-month

### Typical Usage
- 10 extractions per day per user
- 100 users = 1,000 requests/day
- 30,000 requests/month = Free tier

## Security

### Input Validation
- Validate URL format
- Restrict to Instagram/Threads domains
- Sanitize HTML before parsing

### Output Sanitization
- Remove sensitive data
- Limit response size
- Escape special characters

### Rate Limiting
- Per-IP request limits
- Request queue for high traffic
- Abuse detection

## Alternatives

If Cloudflare Workers isn't suitable:

1. **Vercel Serverless Functions**
   ```javascript
   // /api/extract.js
   export default async function handler(req, res) {
     // Similar extraction logic
   }
   ```

2. **Netlify Functions**
   ```javascript
   // netlify/functions/extract.js
   exports.handler = async (event, context) => {
     // Extraction logic
   }
   ```

3. **AWS Lambda**
   - More control
   - Higher costs
   - More setup required

## Updates

Instagram/Threads may change their HTML structure. Monitor:
- OpenGraph tag names
- Page structure
- Mobile vs desktop differences

Set up alerts for extraction failure rate increases.

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Instagram HTML Structure](https://developers.facebook.com/docs/instagram/oembed)