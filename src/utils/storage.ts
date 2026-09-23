export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
    // Handle quota exceeded or other storage errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Clear old data or implement LRU cache
      clearOldData()
      // Retry
      localStorage.setItem(key, JSON.stringify(data))
    }
  }
}

export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return null
  }
}

export const clearLocalStorage = (): void => {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

export const generatePairCode = (): string => {
  const prefix = 'PACKET-'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoid confusing characters
  let code = ''
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return prefix + code
}

export const validatePairCode = (code: string): boolean => {
  const pattern = /^PACKET-[A-Z0-9]{6}$/
  return pattern.test(code)
}

export const clearOldData = (): void => {
  // Implementation for clearing old data when storage is full
  const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  
  try {
    const places = loadFromLocalStorage<any[]>('packet_places') || []
    const recentPlaces = places.filter(place => {
      const addedAt = new Date(place.addedAt).getTime()
      return addedAt > oneMonthAgo
    })
    
    saveToLocalStorage('packet_places', recentPlaces)
  } catch (error) {
    console.error('Failed to clear old data:', error)
  }
}

export const getStorageUsage = (): { used: number; total: number; percentage: number } => {
  try {
    let total = 0
    let used = 0
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ''
        used += key.length + value.length
      }
    }
    
    // Approximate total storage (typically 5MB-10MB)
    total = 5 * 1024 * 1024 // 5MB
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    }
  } catch (error) {
    console.error('Failed to get storage usage:', error)
    return { used: 0, total: 0, percentage: 0 }
  }
}

export const backupToFile = (): void => {
  try {
    const places = loadFromLocalStorage<any[]>('packet_places') || []
    const appState = loadFromLocalStorage<any>('packet_app_state') || {}
    
    const backup = {
      places,
      appState,
      backupDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const dataStr = JSON.stringify(backup, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `packet-backup-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  } catch (error) {
    console.error('Failed to create backup:', error)
  }
}

export const restoreFromFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const backup = JSON.parse(content)
        
        if (backup.version === '1.0' && Array.isArray(backup.places)) {
          saveToLocalStorage('packet_places', backup.places)
          saveToLocalStorage('packet_app_state', backup.appState || {})
          resolve(true)
        } else {
          console.error('Invalid backup format')
          resolve(false)
        }
      } catch (error) {
        console.error('Failed to restore backup:', error)
        resolve(false)
      }
    }
    
    reader.onerror = () => {
      console.error('Failed to read file')
      resolve(false)
    }
    
    reader.readAsText(file)
  })
}