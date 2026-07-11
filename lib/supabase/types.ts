/**
 * Hand-written to match supabase/migrations/0001_init.sql, in the shape
 * `@supabase/supabase-js` v2's generics expect (mirrors what the Supabase
 * CLI generates). Once the project is live, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 * (then re-add the convenience aliases at the bottom of this file).
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: "patient" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "patient" | "admin";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name: string;
          mode: "clinic" | "home_visit" | "chat";
          price_inr: number;
          duration_min: number;
          active: boolean;
          sort: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          mode: "clinic" | "home_visit" | "chat";
          price_inr: number;
          duration_min: number;
          active?: boolean;
          sort?: number;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          weekday: number;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          weekday: number;
          start_time: string;
          end_time: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability_rules"]["Insert"]>;
        Relationships: [];
      };
      availability_exceptions: {
        Row: {
          id: string;
          date: string;
          closed: boolean;
          note: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          closed?: boolean;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["availability_exceptions"]["Insert"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          patient_id: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          mode: "clinic" | "home_visit";
          status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          patient_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          service_id: string;
          starts_at: string;
          ends_at: string;
          mode: "clinic" | "home_visit";
          status?: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
          patient_note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          service_id: string;
          status: "awaiting_payment" | "active" | "answered" | "closed" | "refunded";
          intake: Json;
          consent_at: string;
          scheduled_at: string | null;
          opened_at: string | null;
          expires_at: string | null;
          closed_at: string | null;
          rating: number | null;
          rating_comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          service_id: string;
          status?: "awaiting_payment" | "active" | "answered" | "closed" | "refunded";
          intake?: Json;
          consent_at?: string;
          scheduled_at?: string | null;
          opened_at?: string | null;
          expires_at?: string | null;
          closed_at?: string | null;
          rating?: number | null;
          rating_comment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["consultations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "consultations_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultations_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          consultation_id: string;
          sender_id: string;
          body: string;
          attachments: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          sender_id: string;
          body?: string;
          attachments?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "messages_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          patient_id: string;
          consultation_id: string | null;
          booking_id: string | null;
          provider: "razorpay" | "manual";
          provider_order_id: string | null;
          provider_payment_id: string | null;
          amount_inr: number;
          status: "created" | "paid" | "failed" | "refunded";
          raw: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          consultation_id?: string | null;
          booking_id?: string | null;
          provider: "razorpay" | "manual";
          provider_order_id?: string | null;
          provider_payment_id?: string | null;
          amount_inr: number;
          status?: "created" | "paid" | "failed" | "refunded";
          raw?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "payments_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
        ];
      };
      clinic_settings: {
        Row: { id: boolean; chat_available: boolean };
        Insert: { id?: boolean; chat_available?: boolean };
        Update: Partial<Database["public"]["Tables"]["clinic_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Consultation = Database["public"]["Tables"]["consultations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

/** Shape of one entry in messages.attachments */
export type Attachment = { path: string; name: string; type: string; size: number };

/** Shape of consultations.intake */
export type Intake = {
  problem: string;
  pain_area: string;
  duration: string;
  history: string;
};
