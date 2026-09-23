// Instagram/Threads link extraction worker
// Deploy to Cloudflare Workers for server-side extraction

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCors()
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { url, platform } = await request.json()
    
    if (!url) {
      return jsonResponse({ error: 'URL is required' }, 400)
    }

    // Validate URL
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch {
      return jsonResponse({ error: 'Invalid URL' }, 400)
    }

    // Extract metadata
    const metadata = await extractMetadata(parsedUrl, platform, event)
    
    return jsonResponse(metadata)
    
  } catch (error) {
    console.error('Extraction error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

async function extractMetadata(url, platform, event) {
  // Cache key for Cloudflare Cache
  const cacheKey = new Request(url.toString(), {
    headers: { 'User-Agent': 'Packet-Extraction-Worker' }
  })
  
  // Try cache first
  const cache = caches.default
  let cachedResponse = await cache.match(cacheKey)
  
  if (cachedResponse) {
    const cachedData = await cachedResponse.json()
    return {
      ...cachedData,
      cached: true,
      extractedAt: new Date().toISOString()
    }
  }

  // Fetch the page
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    },
    cf: {
      // Cache for 1 hour
      cacheTtl: 3600,
      cacheEverything: true
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }

  const html = await response.text()
  const metadata = parseMetadata(html, platform, url)

  // Cache the result
  const cacheResponse = new Response(JSON.stringify(metadata), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
  
  event.waitUntil(cache.put(cacheKey, cacheResponse.clone()))

  return metadata
}

function parseMetadata(html, platform, url) {
  // Parse HTML and extract meta tags
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''
  
  // Extract OpenGraph meta tags
  const metaTags = {}
  const metaRegex = /<meta\s+[^>]*(property|name)=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi
  let match
  
  while ((match = metaRegex.exec(html)) !== null) {
    const [, type, name, content] = match
    metaTags[name.toLowerCase()] = content
  }
  
  const ogTitle = metaTags['og:title'] || title
  const ogDescription = metaTags['og:description'] || metaTags['description'] || ''
  const ogImage = metaTags['og:image'] || ''
  
  // Extract restaurant name based on platform
  let restaurantName = ''
  
  if (platform === 'instagram') {
    restaurantName = extractRestaurantNameFromInstagram(ogTitle, ogDescription)
  } else if (platform === 'threads') {
    restaurantName = extractRestaurantNameFromThreads(ogTitle, ogDescription)
  }
  
  // Extract location
  const location = extractLocation(ogDescription)
  
  return {
    title: ogTitle,
    description: ogDescription,
    image: ogImage,
    restaurantName,
    location,
    platform,
    url: url.toString(),
    extractedAt: new Date().toISOString()
  }
}

function extractRestaurantNameFromInstagram(title, description) {
  const text = (title + ' ' + description).toLowerCase()
  
  // Instagram food post patterns
  const patterns = [
    /[🎉🍜🍕🍣🍔🥘🌮🍰🎂]+\s*([^@\n]+?)(?:\s+@|\s*$)/,
    /(?:lunch|dinner|breakfast|brunch)\s+at\s+([^@\n.,!?]+)/i,
    /([^@\n]+?)\s*[🍽️🎉⭐🌟✨]/,
    /(?:visited|tried|went to)\s+([^@\n.,!?]+)/i,
    /^([^@\n-]+?)(?:\s*-\s*)/,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      if (name.length > 2 && name.length < 50) {
        return capitalizeName(name)
      }
    }
  }
  
  // Fallback to first non-URL line
  const lines = title.split('\n')
  for (const line of lines) {
    const cleanLine = line.trim()
    if (cleanLine && !cleanLine.includes('instagram.com') && cleanLine.length < 100) {
      return cleanLine.substring(0, 50)
    }
  }
  
  return ''
}

function extractRestaurantNameFromThreads(title, description) {
  // Similar to Instagram for now
  return extractRestaurantNameFromInstagram(title, description)
}

function extractLocation(description) {
  const patterns = [
    /📍\s*([^@\n]+)/,
    /in\s+([^@\n.,!?]+(?:,\s*[^@\n.,!?]+)*)/i,
    /at\s+([^@\n.,!?]+(?:,\s*[^@\n.,!?]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2,})/,
  ]
  
  for (const pattern of patterns) {
    const match = description.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return ''
}

function capitalizeName(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function jsonResponse(data, status = 200) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  }
  
  return new Response(JSON.stringify(data), {
    status,
    headers
  })
}

function handleCors() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  })
}