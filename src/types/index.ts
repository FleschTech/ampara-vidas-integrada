
// Tipos de usuário
export type UserRole = 'hospital' | 'social_assistance' | 'police' | 'admin' | 'tutelar_council';

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
  cpf?: string | null;
  birth_date: string;
  gender: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistedPersonInput {
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
}

// Tipos de atendimentos
export interface AssistanceCase {
  id: string;
  assisted_person_id: string;
  registered_by: string;
  urgency: UrgencyLevel;
  case_status: CaseStatus;
  description: string;
  suspicion_type?: SuspicionType | null;
  is_suspicious: boolean;
  is_recurrent: boolean;
  alert_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssistanceCaseInput {
  assisted_person_id: string;
  registered_by: string;
  urgency: UrgencyLevel;
  case_status?: CaseStatus;
  description: string;
  suspicion_type?: SuspicionType | null;
  is_suspicious: boolean;
}

// Tipos de acompanhamentos sociais
export interface SocialFollowup {
  id: string;
  case_id: string;
  performed_by: string;
  visit_date?: string | null;
  report: string;
  action_taken?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialFollowupInput {
  case_id: string;
  performed_by: string;
  visit_date?: string | null;
  report: string;
  action_taken?: string | null;
}

// Tipos para documentos de casos
export interface CaseDocument {
  id: string;
  case_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string | null;
}

export interface CaseDocumentInput {
  case_id: string;
  file: File;
  uploaded_by: string;
  description?: string | null;
}

// Tipos para documentos de acompanhamento
export interface FollowupDocument {
  id: string;
  followup_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  uploaded_by: string;
  uploaded_at: string;
  description?: string | null;
}

export interface FollowupDocumentInput {
  followup_id: string;
  file: File;
  uploaded_by: string;
  description?: string | null;
}

// Tipos para criação de usuário pelo admin
export interface UserCreateInput {
  email: string;
  name: string;
  role: UserRole;
  organization?: string | null;
  phone?: string | null;
  password: string;
}
