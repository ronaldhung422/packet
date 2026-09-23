import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
const isConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-application-name': 'packet'
    }
  }
})

export const setupRealtimeSync = (pairCode: string, onSync: (payload: any) => void) => {
  return supabase
    .channel(`pair-${pairCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'places',
        filter: `pair_code=eq.${pairCode}`
      },
      onSync
    )
    .subscribe()
}

export const isSupabaseConfigured = () => isConfigured

// Get sync status
export const getSyncStatus = async () => {
  try {
    const { data, error } = await supabase.from('sync_status').select('*').single()
    
    if (error) {
      // Table might not exist yet
      return {
        online: false,
        lastSync: null,
        error: error.message
      }
    }
    
    return {
      online: true,
      lastSync: data.last_sync,
      error: null
    }
  } catch (error) {
    return {
      online: false,
      lastSync: null,
      error: 'Connection failed'
    }
  }
}

// Health check
export const checkHealth = async () => {
  try {
    const { error } = await supabase.from('places').select('count').limit(1)
    
    return {
      healthy: !error,
      error: error?.message
    }
  } catch (error) {
    return {
      healthy: false,
      error: 'Health check failed'
    }
  }
}