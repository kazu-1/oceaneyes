export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type ObservationStatus =
  | 'unconfirmed'
  | 'unidentified'
  | 'poster_identified'
  | 'shop_confirmed'
  | 'expert_confirmed'
  | 'research_grade'
  | 'review'
  | 'rejected'

export type Database = {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      areas: {
        Row: {
          id: string
          name: string
          name_en: string | null
          description: string | null
          map_position: Json | null
          species_count: number
          post_count: number
          shop_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          description?: string | null
          map_position?: Json | null
          species_count?: number
          post_count?: number
          shop_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['areas']['Insert']>
        Relationships: []
      }
      shops: {
        Row: {
          id: string
          name: string
          area_id: string | null
          phone: string | null
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          area_id?: string | null
          phone?: string | null
          url?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['shops']['Insert']>
        Relationships: []
      }
      points: {
        Row: {
          id: string
          name: string
          area_id: string | null
          type: 'beach' | 'boat' | null
          depth_min: number | null
          depth_max: number | null
          map_coords: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          area_id?: string | null
          type?: 'beach' | 'boat' | null
          depth_min?: number | null
          depth_max?: number | null
          map_coords?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['points']['Insert']>
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          name: string
          name_en: string | null
          sort_order: number
        }
        Insert: { id?: string; name: string; name_en?: string | null; sort_order?: number }
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
        Relationships: []
      }
      taxa: {
        Row: {
          id: string
          name_ja: string
          name_scientific: string | null
          group_id: string | null
          colors: Json | null
          description: string | null
          record_count: number
          confirmed_areas: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_ja: string
          name_scientific?: string | null
          group_id?: string | null
          colors?: Json | null
          description?: string | null
          record_count?: number
          confirmed_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['taxa']['Insert']>
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          role: 'user' | 'shop' | 'expert' | 'admin'
          shop_id: string | null
          dive_count: number
          post_count: number
          species_count: number
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'shop' | 'expert' | 'admin'
          shop_id?: string | null
          dive_count?: number
          post_count?: number
          species_count?: number
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      observations: {
        Row: {
          id: string
          user_id: string | null
          photo_url: string | null
          photo_path: string | null
          species_id: string | null
          species_name_raw: string | null
          area_id: string | null
          point_id: string | null
          shop_id: string | null
          observed_at: string
          depth_min: number | null
          depth_max: number | null
          temperature: number | null
          visibility: number | null
          abundance: 'single' | 'few' | 'several' | 'many' | 'school' | null
          substrate: string | null
          habitat: string | null
          comment: string | null
          map_coords: Json | null
          permissions: ObservationPermissions
          status: ObservationStatus
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          photo_url?: string | null
          photo_path?: string | null
          species_id?: string | null
          species_name_raw?: string | null
          area_id?: string | null
          point_id?: string | null
          shop_id?: string | null
          observed_at: string
          depth_min?: number | null
          depth_max?: number | null
          temperature?: number | null
          visibility?: number | null
          abundance?: 'single' | 'few' | 'several' | 'many' | 'school' | null
          substrate?: string | null
          habitat?: string | null
          comment?: string | null
          map_coords?: Json | null
          permissions?: ObservationPermissions
          status?: ObservationStatus
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['observations']['Insert']>
        Relationships: []
      }
      identifications: {
        Row: {
          id: string
          observation_id: string
          user_id: string | null
          species_id: string | null
          role: string
          comment: string | null
          action: 'identify' | 'confirm' | 'hold' | 'reject' | 'reopen'
          created_at: string
        }
        Insert: {
          id?: string
          observation_id: string
          user_id?: string | null
          species_id?: string | null
          role: string
          comment?: string | null
          action: 'identify' | 'confirm' | 'hold' | 'reject' | 'reopen'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['identifications']['Insert']>
        Relationships: []
      }
    }
  }
}

export type ObservationPermissions = {
  web_public: boolean
  pr_use: boolean
  research_use: boolean
  credit_type: 'handle' | 'real_name' | 'anonymous'
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Area = Tables<'areas'>
export type Shop = Tables<'shops'>
export type Point = Tables<'points'>
export type Group = Tables<'groups'>
export type Taxon = Tables<'taxa'>
export type Profile = Tables<'profiles'>
export type Observation = Tables<'observations'>
export type Identification = Tables<'identifications'>

export type ObservationWithRelations = Observation & {
  profile?: Profile | null
  taxon?: (Taxon & { group?: Group | null }) | null
  area?: Area | null
  point?: Point | null
  shop?: Shop | null
  identifications?: (Identification & { profile?: Profile | null; taxon?: Taxon | null })[]
}

export type TaxonWithGroup = Taxon & { group?: Group | null }
