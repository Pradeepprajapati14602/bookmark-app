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
      bookmarks: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title: string
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string
          tags?: string[] | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Bookmark = Database['public']['Tables']['bookmarks']['Row']
export type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert']
