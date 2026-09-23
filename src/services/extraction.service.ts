import { LinkMetadata } from '../types'

export class ExtractionService {
  private cache = new Map<string, LinkMetadata>()
  private extractionApiUrl = import.meta.env.VITE_EXTRACTION_API_URL || ''

  // Extract metadata from Instagram/Threads link
  async extractMetadata(url: string): Promise<LinkMetadata> {
    // Check cache first
    const cached = this.cache.get(url)
    if (cached && Date.now() - new Date(cached.extractedAt).getTime() < 24 * 60 * 60 * 1000) {
      return cached
    }

    const platform = this.detectPlatform(url)
    
    try {
      let metadata: LinkMetadata
      
      if (platform === 'manual') {
        // For manual entries, just return basic info
        metadata = {
          title: '',
          description: '',
          image: '',
          restaurantName: '',
          location: '',
          extractedAt: new Date().toISOString(),
          platform: 'manual'
        }
      } else {
        if (this.extractionApiUrl) {
          metadata = await this.extractFromApi(url, platform)
        } else {
          metadata = await this.extractClientSide(url, platform)
        }

        if (!metadata.restaurantName && this.extractionApiUrl) {
          metadata = await this.extractClientSide(url, platform)
        }
      }

      // Cache the result
      this.cache.set(url, metadata)
      
      return metadata
      
    } catch (error) {
      console.error('Extraction failed:', error)
      
      return {
        title: '',
        description: '',
        image: '',
        restaurantName: '',
        location: '',
        phone: '',
        extractedAt: new Date().toISOString(),
        platform,
        error: 'Failed to extract restaurant information'
      }
    }
  }

  // Extract using Cloudflare Worker API
  private async extractFromApi(url: string, platform: 'instagram' | 'threads'): Promise<LinkMetadata> {
    try {
      const response = await fetch(this.extractionApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, platform })
      })

      if (!response.ok) {
        throw new Error(`API response: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        title: data.title || '',
        description: data.description || '',
        image: data.image || '',
        restaurantName: data.restaurantName || '',
        location: data.location || '',
        phone: data.phone || '',
        extractedAt: new Date().toISOString(),
        platform,
        error: data.error
      }
      
    } catch (error) {
      console.warn('API extraction failed, falling back to client-side:', error)
      throw error
    }
  }

  // Client-side extraction as fallback
  private async extractClientSide(url: string, platform: 'instagram' | 'threads'): Promise<LinkMetadata> {
    console.log('[extractClientSide] Starting extraction for:', url);
    
    try {
      // 使用我們的 Vercel Edge Function 來避免 CORS 問題
      const apiUrl = `/api/instagram?url=${encodeURIComponent(url)}`;
      console.log('[extractClientSide] API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET'
      });
      
      console.log('[extractClientSide] Response status:', response.status);
      console.log('[extractClientSide] Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[extractClientSide] API Error:', errorText);
        throw new Error(`API Error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[extractClientSide] Got result, has data:', !!result.data);
      
      const data = result.data;
      
      if (!data) {
        console.error('[extractClientSide] No data in response');
        throw new Error('No data returned from API');
      }
      
      // 組合文字用於提取
      const captionText = data.caption?.text || '';
      console.log('[extractClientSide] Caption length:', captionText.length);
      
      // 餐廳名稱優先順序：
      // 1. API 的 location.name 欄位（通常是地點名稱）
      // 2. 從 caption 文字中智能提取
      const restaurantName = data.location?.name || 
                            this.extractRestaurantNameFromInstagram(captionText, '');
      console.log('[extractClientSide] Restaurant name:', restaurantName);
      
      // 地址優先順序：
      // 1. API 的 location.address
      // 2. 從文字中提取
      const location = data.location?.address || this.extractLocation(captionText);
      console.log('[extractClientSide] Location:', location);
      
      const extracted = {
        title: captionText,
        description: captionText,
        image: data.image_versions?.items?.[0]?.url_original || 
               data.image_versions?.items?.[0]?.url ||
               data.thumbnail_url_original ||
               data.thumbnail_url || '',
        restaurantName: restaurantName,
        location: location,
        phone: this.extractPhone(captionText),
        extractedAt: new Date().toISOString(),
        platform
      };
      
      console.log('[extractClientSide] Extracted metadata:', extracted);
      return extracted;
      
    } catch (error) {
      console.error('[extractClientSide] Scraping failed:', error);
      
      // 失敗時回到手動輸入
      return {
        title: '',
        description: '',
        image: '',
        restaurantName: '',
        location: '',
        phone: '',
        extractedAt: new Date().toISOString(),
        platform,
        error: '自動抓取失敗，請手動輸入資訊'
      };
    }
  }

  // Detect platform from URL
  private detectPlatform(url: string): 'instagram' | 'threads' | 'manual' {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      if (hostname.includes('instagram.com')) {
        return 'instagram'
      } else if (hostname.includes('threads.net')) {
        return 'threads'
      }
    } catch {
      // Invalid URL
    }
    
    return 'manual'
  }

  // Extract restaurant name from Instagram content
  private extractRestaurantNameFromInstagram(title: string, description: string): string {
    const text = title + ' ' + description
    
    // Common Instagram patterns for food posts
    const patterns = [
      // "🍜 [Restaurant Name]"
      /[🎉🍜🍕🍣🍔🥘🌮🍰🎂☕️🍱🥟🍲🥘]+\s*([^@\n#]+?)(?:\s+[@#]|\s*$)/,
      // "@RestaurantName" or "#RestaurantName" 
      /[@#]([a-zA-Z][a-zA-Z0-9._]{2,29})/,
      // "Lunch at [Restaurant Name]"
      /(?:lunch|dinner|breakfast|brunch|visited|tried|went to|at)\s+([^@\n.,!?#]{3,40})/i,
      // "[Restaurant Name] 🍽️"
      /^([^@\n#]+?)\s*[🍽️🎉⭐🌟✨💫]/,
      // "[Restaurant Name] - "
      /^([^@\n#-]{3,40})(?:\s*[-–—]\s*)/,
      // 中文餐廳名稱（2-20個中文字）
      /([\u4e00-\u9fa5]{2,20})/,
      // 英文餐廳名稱格式 "Restaurant Name" 或 'Restaurant Name'
      /["""']([^"""'@\n]{3,40})["""']/,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        let name = match[1].trim()
        // 清理名稱
        name = name.replace(/[📍🗺️⭐️✨💫🎉]/g, '').trim()
        name = name.replace(/\s{2,}/g, ' ')
        
        // 檢查長度和合理性
        if (name.length >= 2 && name.length <= 50 && !this.isGenericText(name)) {
          return name
        }
      }
    }
    
    // Fallback: First line of title (cleaned)
    const firstLine = title.split('\n')[0].trim()
    if (firstLine && !firstLine.includes('instagram.com') && !firstLine.includes('threads.net')) {
      const cleaned = firstLine.replace(/[🎉🍜🍕🍣🍔🥘🌮🍰🎂☕️📍⭐️✨💫]/g, '').trim()
      if (cleaned.length >= 2 && cleaned.length <= 50) {
        return cleaned.substring(0, 50)
      }
    }
    
    return ''
  }
  
  // Check if text is too generic to be a restaurant name
  private isGenericText(text: string): boolean {
    const generic = [
      'instagram', 'threads', 'post', 'photo', 'video', 'story',
      'food', 'yummy', 'delicious', 'tasty', 'good', 'great',
      'lunch', 'dinner', 'breakfast', 'brunch',
      'today', 'yesterday', 'weekend',
      'click', 'link', 'bio', 'check out'
    ]
    const lower = text.toLowerCase()
    return generic.some(word => lower === word || lower.includes(`${word} `) || lower.includes(` ${word}`))
  }

  // Extract restaurant name from Threads content
  private extractRestaurantNameFromThreads(title: string, description: string): string {
    // Threads patterns are similar to Instagram
    return this.extractRestaurantNameFromInstagram(title, description)
  }

  // Extract location from description
  private extractLocation(text: string): string {
    const patterns = [
      // 📍 emoji 格式
      /📍\s*([^@\n#]+)/,
      // 香港地址格式
      /地址[：:]\s*([^@\n#]+)/,
      /位置[：:]\s*([^@\n#]+)/,
      /(?:address|location)[：:]\s*([^@\n#]+)/i,
      // 香港區域（九龍、香港島、新界）
      /([九龍|尖沙咀|旺角|油麻地|佐敦|紅磡|觀塘|黃大仙|深水埗|荃灣|沙田|大埔|元朗|屯門|中環|銅鑼灣|灣仔|北角|鰂魚涌|柴灣|筲箕灣|西營盤|上環|金鐘][^@\n#，,。.]+)/,
      // 香港島、九龍、新界
      /(?:香港島|九龍|新界)[^@\n#，,。.]+/,
      // MTR 站名格式
      /(?:near|at|in)\s+([A-Za-z\s]+(?:MTR|Station|Road|Street))/i,
      // 一般英文地址
      /(?:at|in)\s+([^@\n.,!?]+(?:,\s*[^@\n.,!?]+){1,2})/i,
      // 樓層格式（香港常見）
      /([^@\n]+(?:G\/F|[0-9]+\/F|Shop\s+\d+)[^@\n#，,。.]+)/i,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        let location = match[1].trim()
        // 清理位置文字
        location = location.replace(/[📍]/g, '').trim()
        if (location.length > 3 && location.length < 150) {
          return location
        }
      }
    }
    
    return ''
  }

  // Extract phone number from description
  private extractPhone(text: string): string {
    const patterns = [
      // 中文電話格式
      /(?:電話|tel|phone|☎️|📞)[：:]\s*([\d\-\s()]+)/i,
      /(?:訂位|預約|聯絡)[：:]\s*([\d\-\s()]+)/i,
      // 香港手機格式 (5, 6, 9 開頭的8位數字)
      /([569]\d{3}[\s\-]?\d{4})/,
      // 香港固網 (2, 3 開頭的8位數字)
      /([23]\d{3}[\s\-]?\d{4})/,
      // 國際格式 +852
      /(\+852[\s\-]?[2-9]\d{3}[\s\-]?\d{4})/,
      // 台灣手機格式 09XX-XXXXXX
      /(09\d{2}[\s\-]?\d{3}[\s\-]?\d{3})/,
      // 台灣市話格式 0X-XXXX-XXXX
      /(0[2-8][\s\-]?\d{3,4}[\s\-]?\d{4})/,
      // 一般數字格式（至少8位數）
      /(\d{4}[\s\-]\d{4})/,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        let phone = match[1].trim()
        // 標準化電話號碼格式
        phone = phone.replace(/[\s()]/g, '')
        if (phone.length >= 8) {
          return phone
        }
      }
    }
    
    return ''
  }

  // Validate Instagram/Threads URL
  validateSocialUrl(url: string): { isValid: boolean; platform: 'instagram' | 'threads' | 'manual'; message?: string } {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      
      // Check for Instagram
      if (hostname.includes('instagram.com')) {
        const path = urlObj.pathname
        // Instagram post or reel
        if (path.includes('/p/') || path.includes('/reel/')) {
          return { isValid: true, platform: 'instagram' }
        }
        return { 
          isValid: false, 
          platform: 'instagram', 
          message: 'Please use a post or reel link (not profile or story)' 
        }
      }
      
      // Check for Threads
      if (hostname.includes('threads.net')) {
        const path = urlObj.pathname
        // Threads post
        if (path.includes('/post/')) {
          return { isValid: true, platform: 'threads' }
        }
        return { 
          isValid: false, 
          platform: 'threads', 
          message: 'Please use a post link' 
        }
      }
      
      return { isValid: false, platform: 'manual', message: 'Please use Instagram or Threads link' }
      
    } catch {
      return { isValid: false, platform: 'manual', message: 'Invalid URL' }
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([url, metadata]) => ({
        url: url.substring(0, 50) + '...',
        cachedAt: metadata.extractedAt,
        restaurantName: metadata.restaurantName
      }))
    }
  }
}

// Singleton instance
export const extractionService = new ExtractionService()