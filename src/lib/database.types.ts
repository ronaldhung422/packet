export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pairs: {
        Row: {
          id: string
          pair_code: string
          created_at: string
          last_sync: string
          is_active: boolean
        }
        Insert: {
          id?: string
          pair_code: string
          created_at?: string
          last_sync?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          pair_code?: string
          created_at?: string
          last_sync?: string
          is_active?: boolean
        }
      }
      places: {
        Row: {
          id: string
          pair_code: string
          name: string
          description: string | null
          link: string
          extracted_from: string | null
          category: 'want-to-try' | 'been-there' | 'favorites'
          tags: string[]
          added_by: 'ronald' | 'kerry'
          added_at: string
          location: Json | null
          memories: Json[]
          visited_at: string | null
          rating: number | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          pair_code: string
          name: string
          description?: string | null
          link: string
          extracted_from?: string | null
          category: 'want-to-try' | 'been-there' | 'favorites'
          tags?: string[]
          added_by: 'ronald' | 'kerry'
          added_at?: string
          location?: Json | null
          memories?: Json[]
          visited_at?: string | null
          rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          pair_code?: string
          name?: string
          description?: string | null
          link?: string
          extracted_from?: string | null
          category?: 'want-to-try' | 'been-there' | 'favorites'
          tags?: string[]
          added_by?: 'ronald' | 'kerry'
          added_at?: string
          location?: Json | null
          memories?: Json[]
          visited_at?: string | null
          rating?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      sync_status: {
        Row: {
          pair_code: string
          last_sync: string
          pending_changes: number
          sync_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          pair_code: string
          last_sync?: string
          pending_changes?: number
          sync_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          pair_code?: string
          last_sync?: string
          pending_changes?: number
          sync_error?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sync_places: {
        Args: {
          p_pair_code: string
          p_places: Json[]
        }
        Returns: {
          synced_count: number
          conflicts: number
        }[]
      }
      get_pair_stats: {
        Args: {
          p_pair_code: string
        }
        Returns: {
          total_places: number
          places_by_category: Json
          places_by_person: Json
          last_sync: string
        }[]
      }
    }
    Enums: {
      place_category: ['want-to-try', 'been-there', 'favorites']
      person: ['ronald', 'kerry']
    }
  }
}