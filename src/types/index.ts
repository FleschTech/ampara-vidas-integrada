
// Tipos de usuário
export type UserRole = 'hospital' | 'social_assistance' | 'police' | 'admin';

// Tipos de status de caso
export type CaseStatus = 'open' | 'in_progress' | 'referred' | 'closed';

// Tipos de urgência
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

// Tipos de suspeita
export type SuspicionType = 'physical_abuse' | 'psychological_abuse' | 'sexual_abuse' | 'negligence' | 'other';

// Tipos de perfil
export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  organization?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos de pessoas assistidas
export interface AssistedPerson {
  id: string;
  full_name: string;
  cpf?: string;
  birth_date: string;
  gender: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AssistedPersonInput {
  full_name: string;
  cpf?: string;
  birth_date: string;
  gender: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code?: string;
  phone?: string;
}

// Tipos de atendimentos
export interface AssistanceCase {
  id: string;
  assisted_person_id: string;
  registered_by: string;
  urgency: UrgencyLevel;
  case_status: CaseStatus;
  description: string;
  suspicion_type?: SuspicionType;
  is_suspicious: boolean;
  is_recurrent: boolean;
  alert_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssistanceCaseInput {
  assisted_person_id: string;
  registered_by?: string;
  urgency: UrgencyLevel;
  case_status?: CaseStatus;
  description: string;
  suspicion_type?: SuspicionType;
  is_suspicious: boolean;
}

// Tipos de acompanhamentos sociais
export interface SocialFollowup {
  id: string;
  case_id: string;
  performed_by: string;
  visit_date?: string;
  report: string;
  action_taken?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialFollowupInput {
  case_id: string;
  performed_by: string;
  visit_date?: string;
  report: string;
  action_taken?: string | null;
}
