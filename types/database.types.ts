export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      clients: {
        Row: {
          created_at: string
          id: string
          logo_path: string | null
          name: string
          order_index: number
          published: boolean
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_path?: string | null
          name: string
          order_index?: number
          published?: boolean
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_path?: string | null
          name?: string
          order_index?: number
          published?: boolean
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          budget_range: string | null
          created_at: string
          email: string
          email_sent: boolean
          id: string
          message: string
          name: string
          phone: string | null
          service_interest: string | null
          status: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          email: string
          email_sent?: boolean
          id?: string
          message: string
          name: string
          phone?: string | null
          service_interest?: string | null
          status?: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string | null
          service_interest?: string | null
          status?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          external_id: string | null
          external_url: string | null
          height: number | null
          id: string
          is_featured: boolean
          is_placeholder: boolean
          media_type: string
          order_index: number
          provider: string
          published: boolean
          service_id: string | null
          slug: string | null
          storage_path: string | null
          tags: string[]
          thumbnail_path: string | null
          title: string
          updated_at: string
          width: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          external_id?: string | null
          external_url?: string | null
          height?: number | null
          id?: string
          is_featured?: boolean
          is_placeholder?: boolean
          media_type: string
          order_index?: number
          provider?: string
          published?: boolean
          service_id?: string | null
          slug?: string | null
          storage_path?: string | null
          tags?: string[]
          thumbnail_path?: string | null
          title: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          external_id?: string | null
          external_url?: string | null
          height?: number | null
          id?: string
          is_featured?: boolean
          is_placeholder?: boolean
          media_type?: string
          order_index?: number
          provider?: string
          published?: boolean
          service_id?: string | null
          slug?: string | null
          storage_path?: string | null
          tags?: string[]
          thumbnail_path?: string | null
          title?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          is_addon: boolean
          order_index: number
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_addon?: boolean
          order_index?: number
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_addon?: boolean
          order_index?: number
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          address: string | null
          bio_body: string
          bio_heading: string
          bio_image_path: string | null
          brand_name: string
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          founder_name: string
          hero_cta_label: string
          hero_subtitle: string
          hero_title: string
          id: number
          meta_description: string
          meta_title: string
          og_image_path: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bio_body?: string
          bio_heading?: string
          bio_image_path?: string | null
          brand_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          founder_name?: string
          hero_cta_label?: string
          hero_subtitle?: string
          hero_title?: string
          id?: number
          meta_description?: string
          meta_title?: string
          og_image_path?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bio_body?: string
          bio_heading?: string
          bio_image_path?: string | null
          brand_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          founder_name?: string
          hero_cta_label?: string
          hero_subtitle?: string
          hero_title?: string
          id?: number
          meta_description?: string
          meta_title?: string
          og_image_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_theme: {
        Row: {
          accent: string
          accent_foreground: string
          background: string
          border: string
          foreground: string
          id: number
          input: string
          muted: string
          muted_foreground: string
          primary: string
          primary_foreground: string
          radius: number
          ring: string
          secondary: string
          secondary_foreground: string
          updated_at: string
        }
        Insert: {
          accent?: string
          accent_foreground?: string
          background?: string
          border?: string
          foreground?: string
          id?: number
          input?: string
          muted?: string
          muted_foreground?: string
          primary?: string
          primary_foreground?: string
          radius?: number
          ring?: string
          secondary?: string
          secondary_foreground?: string
          updated_at?: string
        }
        Update: {
          accent?: string
          accent_foreground?: string
          background?: string
          border?: string
          foreground?: string
          id?: number
          input?: string
          muted?: string
          muted_foreground?: string
          primary?: string
          primary_foreground?: string
          radius?: number
          ring?: string
          secondary?: string
          secondary_foreground?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          id: string
          order_index: number
          platform: string
          url: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          platform: string
          url?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          platform?: string
          url?: string
          visible?: boolean
        }
        Relationships: []
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

