export interface Place {
  id: string
  name: string
  description?: string
  link: string
  extractedFrom?: string
  location?: {
    lat?: number
    lng?: number
    address?: string
  }
  phone?: string
  category: 'want-to-try' | 'been-there' | 'favorites'
  placeType?: PlaceType
  tags: string[]
  discoveredBy: 'ronald' | 'kerry'
  addedAt: string
  memories: Memory[]
  visitedAt?: string
  rating?: number
  notes?: string
  collectionIds: string[]
  likedBy: ('ronald' | 'kerry')[]
  coverImage?: string
}

// 新增：地點類型
export type PlaceType = 
  | 'restaurant'    // 餐館
  | 'cafe'          // 咖啡館
  | 'bar'           // 酒吧
  | 'dessert'       // 甜點
  | 'fastFood'      // 快餐
  | 'fineDining'    // 高級餐廳
  | 'streetFood'    // 街頭小吃
  | 'bakery'        // 麵包店
  | 'other'         // 其他

export interface Memory {
  id: string
  text: string
  date: string
  images?: string[]
}

export interface AppState {
  isPaired: boolean
  pairCode?: string
  currentUser?: User
  partnerName?: User
  lastSync: string
  offlineChanges: number
}

export interface Stats {
  totalPlaces: number
  placesByCategory: {
    'want-to-try': number
    'been-there': number
    favorites: number
  }
  placesByPerson: {
    ronald: number
    kerry: number
  }
  placesByType?: Record<PlaceType, number>  // 新增：按類型統計
  recentAdditions: Place[]
  mostVisited: Place[]
  lastVisit?: string
}

export interface SyncState {
  isSyncing: boolean
  lastSync: string
  error?: string
  pendingChanges: number
}

export type SocialPlatform = 'instagram' | 'threads' | 'manual'

export interface LinkMetadata {
  title?: string
  description?: string
  image?: string
  restaurantName?: string
  location?: string
  phone?: string
  extractedAt: string
  platform: SocialPlatform
  error?: string
}

// 新增：翻譯介面
export interface Translations {
  [key: string]: {
    'zh-TW': string
    'en': string
  }
}

// User type
export type User = 'ronald' | 'kerry'

// User Profile
export interface UserProfile {
  userId: string
  displayName: User
  avatarEmoji: string
  createdAt: string
}

// Place Collection (收藏夾)
export interface PlaceCollection {
  id: string
  collectionId: string
  name: string
  emoji: string
  coverImage?: string
  placeIds: string[]
  displayOrder: number
  createdBy: User
  createdAt: string
  updatedAt?: string
}

// Filter type for chips
export type FilterType = 'all' | 'chinese' | 'cafe' | 'dessert' | 'japanese' | 'bar' | 'travel'

export interface FilterChip {
  id: FilterType
  label: string
  emoji: string
}