export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          case_id: string
          created_at: string
          description: string
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
        }
        Insert: {
          alert_type: string
          case_id: string
          created_at?: string
          description: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
        }
        Update: {
          alert_type?: string
          case_id?: string
          created_at?: string
          description?: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "assistance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      assistance_cases: {
        Row: {
          alert_generated: boolean | null
          assisted_person_id: string
          case_status: Database["public"]["Enums"]["case_status"]
          created_at: string
          description: string
          id: string
          is_recurrent: boolean | null
          is_suspicious: boolean | null
          registered_by: string
          suspicion_type: Database["public"]["Enums"]["suspicion_type"] | null
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          alert_generated?: boolean | null
          assisted_person_id: string
          case_status?: Database["public"]["Enums"]["case_status"]
          created_at?: string
          description: string
          id?: string
          is_recurrent?: boolean | null
          is_suspicious?: boolean | null
          registered_by: string
          suspicion_type?: Database["public"]["Enums"]["suspicion_type"] | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          alert_generated?: boolean | null
          assisted_person_id?: string
          case_status?: Database["public"]["Enums"]["case_status"]
          created_at?: string
          description?: string
          id?: string
          is_recurrent?: boolean | null
          is_suspicious?: boolean | null
          registered_by?: string
          suspicion_type?: Database["public"]["Enums"]["suspicion_type"] | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "assistance_cases_assisted_person_id_fkey"
            columns: ["assisted_person_id"]
            isOneToOne: false
            referencedRelation: "assisted_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      assisted_persons: {
        Row: {
          address: string
          birth_date: string
          city: string
          cpf: string | null
          created_at: string
          full_name: string
          gender: string
          id: string
          neighborhood: string
          phone: string | null
          state: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address: string
          birth_date: string
          city: string
          cpf?: string | null
          created_at?: string
          full_name: string
          gender: string
          id?: string
          neighborhood: string
          phone?: string | null
          state: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string
          birth_date?: string
          city?: string
          cpf?: string | null
          created_at?: string
          full_name?: string
          gender?: string
          id?: string
          neighborhood?: string
          phone?: string | null
          state?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "assistance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      police_referrals: {
        Row: {
          case_id: string
          created_at: string
          id: string
          referral_date: string
          referred_by: string
          report_details: string
          status: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          referral_date?: string
          referred_by: string
          report_details: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          referral_date?: string
          referred_by?: string
          report_details?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "police_referrals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "assistance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          organization: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          organization?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      social_followups: {
        Row: {
          action_taken: string | null
          case_id: string
          created_at: string
          id: string
          performed_by: string
          report: string
          updated_at: string
          visit_date: string | null
        }
        Insert: {
          action_taken?: string | null
          case_id: string
          created_at?: string
          id?: string
          performed_by: string
          report: string
          updated_at?: string
          visit_date?: string | null
        }
        Update: {
          action_taken?: string | null
          case_id?: string
          created_at?: string
          id?: string
          performed_by?: string
          report?: string
          updated_at?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_followups_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "assistance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      case_status: "open" | "in_progress" | "referred" | "closed"
      suspicion_type:
        | "physical_abuse"
        | "psychological_abuse"
        | "sexual_abuse"
        | "negligence"
        | "other"
      urgency_level: "low" | "medium" | "high" | "critical"
      user_role: "hospital" | "social_assistance" | "police" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      case_status: ["open", "in_progress", "referred", "closed"],
      suspicion_type: [
        "physical_abuse",
        "psychological_abuse",
        "sexual_abuse",
        "negligence",
        "other",
      ],
      urgency_level: ["low", "medium", "high", "critical"],
      user_role: ["hospital", "social_assistance", "police", "admin"],
    },
  },
} as const
