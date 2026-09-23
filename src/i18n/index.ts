export const translations = {
  // Navigation & Common
  navigation: {
    home: { 'zh-TW': '首頁', en: 'Home' },
    places: { 'zh-TW': '地點', en: 'Places' },
    add: { 'zh-TW': '新增', en: 'Add' },
    map: { 'zh-TW': '地圖', en: 'Map' },
    stats: { 'zh-TW': '統計', en: 'Stats' },
    pair: { 'zh-TW': '配對', en: 'Pair' },
  },
  
  // Page Titles
  addNewPlace: { 'zh-TW': '新增地點', en: 'Add New Place' },
  pairWithPartner: { 'zh-TW': '與伴侶配對', en: 'Pair with Partner' },
  foodDiscoveryStats: { 'zh-TW': '美食探索統計', en: 'Food Discovery Stats' },
  
  // Settings Page
  language: { 'zh-TW': '語言', en: 'Language' },
  about: { 'zh-TW': '關於', en: 'About' },
  account: { 'zh-TW': '帳號', en: 'Account' },
  settings: { 'zh-TW': '設定', en: 'Settings' },
  
  // Place Types (matching your screenshot categories)
  categories: { 'zh-TW': '分類', en: 'Categories' },
  allCategories: { 'zh-TW': '所有分類', en: 'All Categories' },
  restaurant: { 'zh-TW': '餐廳', en: 'Restaurant' },
  cafe: { 'zh-TW': '咖啡廳', en: 'Café' },
  bar: { 'zh-TW': '酒吧', en: 'Bar' },
  dessert: { 'zh-TW': '甜點', en: 'Dessert' },
  fastFood: { 'zh-TW': '快餐', en: 'Fast Food' },
  fineDining: { 'zh-TW': '高級餐廳', en: 'Fine Dining' },
  streetFood: { 'zh-TW': '街頭小吃', en: 'Street Food' },
  bakery: { 'zh-TW': '麵包店', en: 'Bakery' },
  other: { 'zh-TW': '其他', en: 'Other' },
  
  // Status
  wantToTry: { 'zh-TW': '想去試試', en: 'Want to Try' },
  beenThere: { 'zh-TW': '去過了', en: 'Been There' },
  favorites: { 'zh-TW': '最愛', en: 'Favorites' },
  
  // Actions
  save: { 'zh-TW': '儲存', en: 'Save' },
  cancel: { 'zh-TW': '取消', en: 'Cancel' },
  delete: { 'zh-TW': '刪除', en: 'Delete' },
  edit: { 'zh-TW': '編輯', en: 'Edit' },
  back: { 'zh-TW': '返回', en: 'Back' },
  next: { 'zh-TW': '下一步', en: 'Next' },
  submit: { 'zh-TW': '提交', en: 'Submit' },
  
  // Form Labels
  name: { 'zh-TW': '名稱', en: 'Name' },
  description: { 'zh-TW': '描述', en: 'Description' },
  location: { 'zh-TW': '地點', en: 'Location' },
  tags: { 'zh-TW': '標籤', en: 'Tags' },
  notes: { 'zh-TW': '備註', en: 'Notes' },
  category: { 'zh-TW': '分類', en: 'Category' },
  addedBy: { 'zh-TW': '新增者', en: 'Added By' },
  
  // Placeholders
  enterName: { 'zh-TW': '輸入餐廳名稱', en: 'Enter restaurant name' },
  enterDescription: { 'zh-TW': '這個地方有什麼特別的？', en: 'What makes this place special?' },
  enterLocation: { 'zh-TW': '地址或區域', en: 'Address or area' },
  addTags: { 'zh-TW': '新增標籤（例如：披薩、義大利、約會）', en: 'Add tags (e.g., pizza, italian, date-night)' },
  
  // Messages
  success: { 'zh-TW': '成功！', en: 'Success!' },
  error: { 'zh-TW': '錯誤', en: 'Error' },
  loading: { 'zh-TW': '載入中...', en: 'Loading...' },
  noPlaces: { 'zh-TW': '還沒有地點', en: 'No places yet' },
  addFirstPlace: { 'zh-TW': '新增你的第一個地點', en: 'Add your first place' },
  
  // Stats Page
  totalPlaces: { 'zh-TW': '總地點數', en: 'Total Places' },
  visited: { 'zh-TW': '已造訪', en: 'Visited' },
  wishlist: { 'zh-TW': '願望清單', en: 'Wishlist' },
  topCategories: { 'zh-TW': '熱門分類', en: 'Top Categories' },
  recentlyAdded: { 'zh-TW': '最近新增', en: 'Recently Added' },
  places: { 'zh-TW': '個地點', en: 'places' },
  
  // Pairing Page
  pairCode: { 'zh-TW': '配對碼', en: 'Pair Code' },
  enterPairCode: { 'zh-TW': '輸入配對碼', en: 'Enter pair code' },
  generateCode: { 'zh-TW': '產生配對碼', en: 'Generate Code' },
  shareCode: { 'zh-TW': '分享此配對碼給你的伴侶', en: 'Share this code with your partner' },
  paired: { 'zh-TW': '已配對', en: 'Paired' },
  notPaired: { 'zh-TW': '未配對', en: 'Not Paired' },
}

export type TranslationKey = keyof typeof translations
export type Language = 'zh-TW' | 'en'

// Translation helper function
const translate = (key: string, language: Language): string => {
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    value = value?.[k]
    if (!value) return key
  }
  
  return value[language] || value.en || key
}

// Create i18n object with t() method
const i18n = {
  t: (key: string, language: Language = 'zh-TW'): string => {
    return translate(key, language)
  }
}

export default i18n
