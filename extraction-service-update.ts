// 在 extraction.service.ts 中

private async extractClientSide(url: string, platform: 'instagram' | 'threads'): Promise<LinkMetadata> {
  try {
    // 使用統一的社交媒體 scraper API
    const apiUrl = `/api/scrape-social-media?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.title + ' ' + data.description;
    
    // 智能提取資訊
    return {
      title: data.title || '',
      description: data.description || '',
      image: data.image || '',
      // 優先使用 API 提供的地點，否則從文字提取
      restaurantName: this.extractRestaurantNameFromInstagram(data.title, data.description),
      location: data.location || this.extractLocation(text),
      phone: this.extractPhone(text),
      extractedAt: new Date().toISOString(),
      platform: data.platform || platform
    };
    
  } catch (error) {
    console.error('Scraping failed:', error);
    
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
      error: '自動抓取失敗，請手動輸入'
    };
  }
}

// 更新 extractRestaurantNameFromInstagram 支援更多場景
private extractRestaurantNameFromInstagram(title: string, description: string): string {
  const text = title + ' ' + description;
  
  const patterns = [
    // 餐廳相關
    /[🍜🍕🍣🍔🥘🌮🍰🎂☕️🍱🥟🍲]+\s*([^@\n#]+?)(?:\s+[@#]|\s*$)/,
    
    // 地點相關
    /[📍🗺️🌍🌎🌏]+\s*([^@\n#]+?)(?:\s+[@#]|\s*$)/,
    
    // 活動/展覽相關
    /[🎨🎭🎪🎡🎢]+\s*([^@\n#]+?)(?:\s+[@#]|\s*$)/,
    
    // 景點相關
    /[🏖️🏝️⛰️🏔️🗻]+\s*([^@\n#]+?)(?:\s+[@#]|\s*$)/,
    
    // @ 提及
    /[@#]([a-zA-Z][a-zA-Z0-9._]{2,29})/,
    
    // "at XXX" 格式
    /(?:at|in|@)\s+([^@\n.,!?#]{3,40})/i,
    
    // 中文名稱
    /([\u4e00-\u9fa5]{2,20})/,
    
    // 引號包圍
    /["""']([^"""'@\n]{3,40})["""']/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let name = match[1].trim();
      name = name.replace(/[📍🗺️⭐️✨💫🎉🍜🍕🍣]/g, '').trim();
      name = name.replace(/\s{2,}/g, ' ');
      
      if (name.length >= 2 && name.length <= 50 && !this.isGenericText(name)) {
        return name;
      }
    }
  }
  
  return '';
}
