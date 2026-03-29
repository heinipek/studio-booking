export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string
          name: string
          custom_domain: string | null
          logo_url: string | null
          primary_color: string
          secondary_color: string
          settings: TenantSettings
          paytrail_merchant_id: string | null
          paytrail_secret: string | null
          resend_api_key: string | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          full_name: string
          phone: string | null
          date_of_birth: string | null
          base_role: 'super_admin' | 'studio_admin' | 'instructor' | 'customer'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      user_permissions: {
        Row: {
          id: string
          user_id: string
          tenant_id: string
          permission: string
          granted_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_permissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_permissions']['Insert']>
      }
      instructors: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          name: string
          bio: string | null
          photo_url: string | null
          specialties: string[]
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['instructors']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['instructors']['Insert']>
      }
      class_types: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          category: string | null
          color: string
          min_participants: number
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['class_types']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['class_types']['Insert']>
      }
      class_sessions: {
        Row: {
          id: string
          tenant_id: string
          class_type_id: string
          instructor_id: string | null
          starts_at: string
          ends_at: string
          capacity: number
          status: 'scheduled' | 'cancelled' | 'completed' | 'studio_reserved'
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['class_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['class_sessions']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          tenant_id: string
          session_id: string
          user_id: string
          status: 'confirmed' | 'cancelled' | 'late_cancelled' | 'no_show' | 'attended'
          credit_id: string | null
          booked_at: string
          cancelled_at: string | null
          cancellation_reason: string | null
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'booked_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      waitlist: {
        Row: {
          id: string
          tenant_id: string
          session_id: string
          user_id: string
          position: number
          notified_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['waitlist']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['waitlist']['Insert']>
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          type: 'single' | 'series' | 'season' | 'drop_in' | 'private' | 'rental'
          price_cents: number
          credits: number
          validity_days: number
          target_group: 'adult' | 'child' | 'all'
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      purchases: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          product_id: string
          payment_id: string | null
          credits_total: number
          credits_used: number
          expires_at: string
          status: 'active' | 'expired' | 'exhausted'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['purchases']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>
      }
      credits: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          purchase_id: string
          used_at: string | null
          booking_id: string | null
        }
        Insert: Omit<Database['public']['Tables']['credits']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['credits']['Insert']>
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          paytrail_transaction_id: string | null
          amount_cents: number
          status: 'pending' | 'ok' | 'fail' | 'refunded'
          items: Json
          created_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      discount_codes: {
        Row: {
          id: string
          tenant_id: string
          code: string
          type: 'percent' | 'fixed'
          value: number
          max_uses: number | null
          used_count: number
          valid_from: string | null
          valid_until: string | null
          applies_to: Json
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['discount_codes']['Row'], 'id' | 'created_at' | 'used_count'>
        Update: Partial<Database['public']['Tables']['discount_codes']['Insert']>
      }
      studio_pages: {
        Row: {
          id: string
          tenant_id: string
          slug: string
          title: string
          content: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['studio_pages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['studio_pages']['Insert']>
      }
    }
  }
}

export interface TenantSettings {
  cancellation_hours: number        // default: 24
  booking_closes_minutes: number    // default: 60 (1h before)
  min_participants_class: number    // default: 4
  min_participants_workshop: number // default: 5
  waitlist_accept_hours: number     // default: 2
  late_cancel_fee_enabled: boolean
  timezone: string                  // default: 'Europe/Helsinki'
}

// Convenient type aliases
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Instructor = Database['public']['Tables']['instructors']['Row']
export type ClassType = Database['public']['Tables']['class_types']['Row']
export type ClassSession = Database['public']['Tables']['class_sessions']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Waitlist = Database['public']['Tables']['waitlist']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']
export type Credit = Database['public']['Tables']['credits']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type DiscountCode = Database['public']['Tables']['discount_codes']['Row']
export type StudioPage = Database['public']['Tables']['studio_pages']['Row']
