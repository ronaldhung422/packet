import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  const { url } = req.query
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' })
  }
  
  try {
    // 使用正確的 Instagram Scraper 2025.1 API endpoint
    const apiUrl = `https://instagram-scraper-20251.p.rapidapi.com/postdetail/?url_embed_safe=true&code_or_url=${encodeURIComponent(url)}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-scraper-20251.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'ca3e8ce95cmsh8f0a123057ce6f9p165924jsn26410f3a065c'
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({ 
        error: `API Error: ${response.status} ${response.statusText}`,
        details: errorText
      })
    }
    
    const result = await response.json()
    const data = result.data
    
    if (!data) {
      return res.status(500).json({ error: 'No data returned from API' })
    }
    
    // 根據實際 JSON 結構提取資料
    const extracted = {
      title: data.caption?.text || '',
      description: data.caption?.text || '',
      image: data.image_versions?.items?.[0]?.url_original || 
             data.image_versions?.items?.[0]?.url ||
             data.thumbnail_url_original ||
             data.thumbnail_url || '',
      location: data.location?.name || '',
      locationAddress: data.location?.address || '',
      locationLat: data.location?.lat || null,
      locationLng: data.location?.lng || null,
      author: data.user?.username || '',
      authorFullName: data.user?.full_name || '',
      likes: data.metrics?.like_count || 0,
      comments: data.metrics?.comment_count || 0,
      views: data.metrics?.play_count || 0,
      timestamp: data.taken_at || data.taken_at_ts || '',
      shortcode: data.code || '',
      isVideo: data.is_video || false
    }
    
    return res.status(200).json(extracted)
    
  } catch (error: any) {
    console.error('Instagram scraping error:', error)
    return res.status(500).json({ 
      error: error.message || 'Failed to scrape Instagram'
    })
  }
}
