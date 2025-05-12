
// This is a temporary workaround until proper types are generated
// Replace the import in client.ts with this file if needed

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          role: string | null;
          organization: string | null;
          phone: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          role?: string | null;
          organization?: string | null;
          phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          role?: string | null;
          organization?: string | null;
          phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      assisted_persons: {
        Row: {
          id: string;
          full_name: string;
          cpf: string | null;
          birth_date: string;
          gender: string;
          address: string;
          neighborhood: string;
          city: string;
          state: string;
          zip_code: string | null;
          phone: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          full_name: string;
          cpf?: string | null;
          birth_date: string;
          gender: string;
          address: string;
          neighborhood: string;
          city: string;
          state: string;
          zip_code?: string | null;
          phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          cpf?: string | null;
          birth_date?: string;
          gender?: string;
          address?: string;
          neighborhood?: string;
          city?: string;
          state?: string;
          zip_code?: string | null;
          phone?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      assistance_cases: {
        Row: {
          id: string;
          assisted_person_id: string;
          registered_by: string;
          urgency: string;
          case_status: string;
          description: string;
          suspicion_type: string | null;
          is_suspicious: boolean;
          is_recurrent: boolean;
          alert_generated: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          assisted_person_id: string;
          registered_by: string;
          urgency: string;
          case_status?: string;
          description: string;
          suspicion_type?: string | null;
          is_suspicious?: boolean;
          is_recurrent?: boolean;
          alert_generated?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          assisted_person_id?: string;
          registered_by?: string;
          urgency?: string;
          case_status?: string;
          description?: string;
          suspicion_type?: string | null;
          is_suspicious?: boolean;
          is_recurrent?: boolean;
          alert_generated?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      social_followups: {
        Row: {
          id: string;
          case_id: string;
          performed_by: string;
          visit_date: string | null;
          report: string;
          action_taken: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          performed_by: string;
          visit_date?: string | null;
          report: string;
          action_taken?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          performed_by?: string;
          visit_date?: string | null;
          report?: string;
          action_taken?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      alerts: {
        Row: {
          id: string;
          case_id: string;
          alert_type: string;
          description: string;
          is_resolved: boolean;
          resolved_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          case_id: string;
          alert_type: string;
          description: string;
          is_resolved?: boolean;
          resolved_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          case_id?: string;
          alert_type?: string;
          description?: string;
          is_resolved?: boolean;
          resolved_at?: string | null;
          created_at?: string | null;
        };
      };
      police_referrals: {
        Row: {
          id: string;
          case_id: string;
          referred_by: string;
          report_details: string;
          referral_date: string | null;
          status: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          referred_by: string;
          report_details: string;
          referral_date?: string | null;
          status?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          referred_by?: string;
          report_details?: string;
          referral_date?: string | null;
          status?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
