// api/scrape-social-media.ts
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  const { url } = req.query
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL required' })
  }
  
  // 偵測平台
  const isInstagram = url.includes('instagram.com')
  const isThreads = url.includes('threads.net')
  
  try {
    let response;
    
    if (isInstagram) {
      // 使用 Instagram Scraper API
      response = await fetch(
        `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${encodeURIComponent(url)}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
          }
        }
      )
    } else if (isThreads) {
      // 使用 Threads Scraper API
      response = await fetch(
        `https://threads-api4.p.rapidapi.com/post?url=${encodeURIComponent(url)}`,
        {
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'threads-api4.p.rapidapi.com'
          }
        }
      )
    } else {
      return res.status(400).json({ error: 'Unsupported platform' })
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 統一回傳格式
    const normalized = {
      platform: isInstagram ? 'instagram' : 'threads',
      title: data.data?.caption || data.text || '',
      description: data.data?.caption || data.text || '',
      image: data.data?.display_url || data.image_url || '',
      location: data.data?.location?.name || '',
      author: data.data?.owner?.username || data.author?.username || '',
      timestamp: data.data?.taken_at_timestamp || data.timestamp || '',
      likes: data.data?.like_count || data.likes || 0,
      comments: data.data?.comment_count || data.replies || 0
    }
    
    return res.status(200).json(normalized)
    
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message || 'Failed to scrape' 
    })
  }
}
