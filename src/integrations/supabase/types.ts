export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      children: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          coin_balance: number
          created_at: string
          experience_points: number
          gender: string | null
          id: string
          level: number
          name: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          coin_balance?: number
          created_at?: string
          experience_points?: number
          gender?: string | null
          id?: string
          level?: number
          name: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          coin_balance?: number
          created_at?: string
          experience_points?: number
          gender?: string | null
          id?: string
          level?: number
          name?: string
          parent_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback_suggestions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          suggestion: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          suggestion: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          suggestion?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          parent_pin: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          parent_pin?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          parent_pin?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          child_id: string
          id: string
          price_paid: number
          purchased_at: string
          store_item_id: string
        }
        Insert: {
          child_id: string
          id?: string
          price_paid: number
          purchased_at?: string
          store_item_id: string
        }
        Update: {
          child_id?: string
          id?: string
          price_paid?: number
          purchased_at?: string
          store_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_store_item_id_fkey"
            columns: ["store_item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      special_missions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          points: number
          prize: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          points?: number
          prize?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          points?: number
          prize?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      store_items: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_visible: boolean
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_visible?: boolean
          price: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_visible?: boolean
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          date_end: string | null
          date_start: string | null
          description: string | null
          due_date: string | null
          duration_minutes: number | null
          frequency: Database["public"]["Enums"]["task_frequency"] | null
          id: string
          is_completed: boolean
          is_visible: boolean
          points: number
          specific_dates: string[] | null
          time_end: string | null
          time_mode: Database["public"]["Enums"]["time_mode"] | null
          time_start: string | null
          title: string
          updated_at: string
          weekdays: string[] | null
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          frequency?: Database["public"]["Enums"]["task_frequency"] | null
          id?: string
          is_completed?: boolean
          is_visible?: boolean
          points?: number
          specific_dates?: string[] | null
          time_end?: string | null
          time_mode?: Database["public"]["Enums"]["time_mode"] | null
          time_start?: string | null
          title: string
          updated_at?: string
          weekdays?: string[] | null
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          date_end?: string | null
          date_start?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          frequency?: Database["public"]["Enums"]["task_frequency"] | null
          id?: string
          is_completed?: boolean
          is_visible?: boolean
          points?: number
          specific_dates?: string[] | null
          time_end?: string | null
          time_mode?: Database["public"]["Enums"]["time_mode"] | null
          time_start?: string | null
          title?: string
          updated_at?: string
          weekdays?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_created_by_profiles"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_frequency: "DIARIA" | "SEMANAL" | "UNICA" | "DATAS_ESPECIFICAS"
      time_mode: "start-end" | "start-duration"
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
    Enums: {
      task_frequency: ["DIARIA", "SEMANAL", "UNICA", "DATAS_ESPECIFICAS"],
      time_mode: ["start-end", "start-duration"],
    },
  },
} as const
