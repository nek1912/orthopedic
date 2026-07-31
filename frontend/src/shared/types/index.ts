export interface PatientResponse {
  id: string
  name: string
  email: string
  phone: string | null
  dob: string | null
  created_at: string
}

export interface AdminPatientResponse extends PatientResponse {
  total_visits: number
  last_visit_date: string | null
  pending_count: number
  completed_count: number
  prescription_count: number
}

export interface AuthResponse {
  patient: PatientResponse
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string | null
  dob?: string | null
}

export interface ServiceResponse {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  default_fee: number
  preparation_notes: string | null
  requires_followup: boolean
  is_active: boolean
}

export interface DateAvailability {
  count: number
  level: string
  blocked: boolean
}

export interface CalendarResponse {
  dates: Record<string, DateAvailability>
}

export interface AppointmentResponse {
  id: string
  patient_id: string
  patient_name: string
  service_id: string | null
  service_name: string | null
  service_description: string | null
  requested_date: string
  status: string
  rejection_reason: string | null
  suggested_date: string | null
  time_slot_start: string | null
  time_slot_end: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AdminAppointmentDetail extends AppointmentResponse {
  patient_email: string
  patient_phone: string | null
}

export interface AppointmentListResponse {
  appointments: AppointmentResponse[]
}

export interface AppointmentCreate {
  service_id?: string | null
  service_description?: string | null
  requested_date: string
}

export interface AcceptRequest {
  date: string
  start_time: string
  end_time: string
}

export interface RejectRequest {
  reason?: string | null
  suggested_date?: string | null
}

export interface PrescriptionResponse {
  id: string
  appointment_id: string
  patient_name: string
  medicines: Record<string, unknown> | null
  diagnosis: string | null
  notes: string | null
  created_at: string
}

export interface PrescriptionTemplateResponse {
  id: string
  name: string
  diagnosis: string | null
  medicines: Record<string, unknown> | null
  notes: string | null
  created_at: string
}

export interface PrescriptionCreate {
  appointment_id: string
  medicines?: Record<string, unknown> | null
  diagnosis?: string | null
  notes?: string | null
}

export interface UnavailabilityResponse {
  id: string
  date: string
  start_time: string
  end_time: string
  recurring: string
  reason: string | null
}

export interface UnavailabilityCreate {
  date: string
  start_time: string
  end_time: string
  recurring?: string
  reason?: string | null
}

export interface SettingsResponse {
  clinic_name: string | null
  address: string | null
  phone: string | null
  email: string
}

export interface SettingsUpdate {
  clinic_name?: string | null
  address?: string | null
  phone?: string | null
}

export interface AppointmentStats {
  today_count: number
  pending_count: number
  total_patients: number
  completion_rate: number
  next_available_day: string | null
  today_appointments: AppointmentResponse[]
}
