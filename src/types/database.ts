export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booked_at: string
          cancellation_reason: string | null
          cancelled_at: string | null
          credit_id: string | null
          id: string
          session_id: string
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          booked_at?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          credit_id?: string | null
          id?: string
          session_id: string
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          booked_at?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          credit_id?: string | null
          id?: string
          session_id?: string
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_credit"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "credits"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          capacity: number
          class_type_id: string
          created_at: string
          display_title: string | null
          ends_at: string
          id: string
          instructor_id: string | null
          notes: string | null
          starts_at: string
          status: string
          tenant_id: string
        }
        Insert: {
          capacity?: number
          class_type_id: string
          created_at?: string
          display_title?: string | null
          ends_at: string
          id?: string
          instructor_id?: string | null
          notes?: string | null
          starts_at: string
          status?: string
          tenant_id: string
        }
        Update: {
          capacity?: number
          class_type_id?: string
          created_at?: string
          display_title?: string | null
          ends_at?: string
          id?: string
          instructor_id?: string | null
          notes?: string | null
          starts_at?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_class_type_id_fkey"
            columns: ["class_type_id"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      class_types: {
        Row: {
          active: boolean
          category: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          min_participants: number
          name: string
          tenant_id: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          min_participants?: number
          name: string
          tenant_id: string
        }
        Update: {
          active?: boolean
          category?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          min_participants?: number
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          booking_id: string | null
          id: string
          purchase_id: string
          tenant_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          id?: string
          purchase_id: string
          tenant_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          id?: string
          purchase_id?: string
          tenant_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean
          applies_to: Json
          code: string
          created_at: string
          id: string
          max_uses: number | null
          tenant_id: string
          type: string
          used_count: number
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          active?: boolean
          applies_to?: Json
          code: string
          created_at?: string
          id?: string
          max_uses?: number | null
          tenant_id: string
          type: string
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          active?: boolean
          applies_to?: Json
          code?: string
          created_at?: string
          id?: string
          max_uses?: number | null
          tenant_id?: string
          type?: string
          used_count?: number
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          active: boolean
          bio: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          specialties: string[]
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          specialties?: string[]
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          specialties?: string[]
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          completed_at: string | null
          created_at: string
          id: string
          items: Json
          paytrail_transaction_id: string | null
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          completed_at?: string | null
          created_at?: string
          id?: string
          items?: Json
          paytrail_transaction_id?: string | null
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          items?: Json
          paytrail_transaction_id?: string | null
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          credits: number
          description: string | null
          id: string
          name: string
          price_cents: number
          target_group: string
          tenant_id: string
          type: string
          validity_days: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          credits?: number
          description?: string | null
          id?: string
          name: string
          price_cents: number
          target_group?: string
          tenant_id: string
          type: string
          validity_days?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          credits?: number
          description?: string | null
          id?: string
          name?: string
          price_cents?: number
          target_group?: string
          tenant_id?: string
          type?: string
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string
          credits_total: number
          credits_used: number
          expires_at: string
          id: string
          payment_id: string | null
          product_id: string
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_total: number
          credits_used?: number
          expires_at: string
          id?: string
          payment_id?: string | null
          product_id: string
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_total?: number
          credits_used?: number
          expires_at?: string
          id?: string
          payment_id?: string | null
          product_id?: string
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          published: boolean
          slug: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          published?: boolean
          slug: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          published?: boolean
          slug?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_pages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean
          created_at: string
          custom_domain: string | null
          id: string
          logo_url: string | null
          name: string
          paytrail_merchant_id: string | null
          paytrail_secret: string | null
          primary_color: string
          resend_api_key: string | null
          secondary_color: string
          settings: Json
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          paytrail_merchant_id?: string | null
          paytrail_secret?: string | null
          primary_color?: string
          resend_api_key?: string | null
          secondary_color?: string
          settings?: Json
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          paytrail_merchant_id?: string | null
          paytrail_secret?: string | null
          primary_color?: string
          resend_api_key?: string | null
          secondary_color?: string
          settings?: Json
          slug?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          granted_by: string
          id: string
          permission: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by: string
          id?: string
          permission: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          id?: string
          permission?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          base_role: string
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          id: string
          notification_preference: string
          phone: string | null
          phone_verified: boolean
          tenant_id: string
        }
        Insert: {
          base_role?: string
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          id: string
          notification_preference?: string
          phone?: string | null
          phone_verified?: boolean
          tenant_id: string
        }
        Update: {
          base_role?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          id?: string
          notification_preference?: string
          phone?: string | null
          phone_verified?: boolean
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          notified_at: string | null
          position: number
          session_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notified_at?: string | null
          position: number
          session_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          notified_at?: string | null
          position?: number
          session_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      get_my_tenant_id: { Args: never; Returns: string }
      has_permission: { Args: { perm: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ============================================================
// Convenient type aliases
// ============================================================
export type Tenant = Tables<'tenants'>
export type User = Tables<'users'>
export type Instructor = Tables<'instructors'>
export type ClassType = Tables<'class_types'>
export type ClassSession = Tables<'class_sessions'>
export type Booking = Tables<'bookings'>
export type Waitlist = Tables<'waitlist'>
export type Product = Tables<'products'>
export type Purchase = Tables<'purchases'>
export type Credit = Tables<'credits'>
export type Payment = Tables<'payments'>
export type DiscountCode = Tables<'discount_codes'>
export type StudioPage = Tables<'studio_pages'>

export interface TenantSettings {
  cancellation_hours: number
  booking_closes_minutes: number
  min_participants_class: number
  min_participants_workshop: number
  waitlist_accept_hours: number
  late_cancel_fee_enabled: boolean
  timezone: string
}
