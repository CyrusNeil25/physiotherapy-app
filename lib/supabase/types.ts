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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
