export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          phone: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: string;
          phone?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          phone?: string | null;
          location?: string | null;
          created_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string | null;
          department: string;
          position: string;
          status: string;
          last_login: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone?: string | null;
          department: string;
          position: string;
          status?: string;
          last_login?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          department?: string;
          position?: string;
          status?: string;
          last_login?: string | null;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_person: string;
          email: string;
          phone: string | null;
          location: string | null;
          status: string;
          join_date: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person: string;
          email: string;
          phone?: string | null;
          location?: string | null;
          status?: string;
          join_date?: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string;
          email?: string;
          phone?: string | null;
          location?: string | null;
          status?: string;
          join_date?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          customer_id: string;
          amount: number;
          status: "draft" | "unpaid" | "paid";
          invoice_date: string;
          due_date: string;
          collection_date: string;
          waste_quantity: number;
          service_type: "standard" | "premium";
          additional_services: string[];
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          amount: number;
          status?: "draft" | "unpaid" | "paid";
          invoice_date?: string;
          due_date: string;
          collection_date: string;
          waste_quantity: number;
          service_type: "standard" | "premium";
          additional_services?: string[];
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          amount?: number;
          status?: "draft" | "unpaid" | "paid";
          invoice_date?: string;
          due_date?: string;
          collection_date?: string;
          waste_quantity?: number;
          service_type?: "standard" | "premium";
          additional_services?: string[];
          notes?: string;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          contact_person: string;
          email: string;
          phone: string | null;
          status: "active" | "inactive";
          type: "apartment" | "corporate_office" | "estate";
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person: string;
          email: string;
          phone?: string | null;
          status?: "active" | "inactive";
          type: "apartment" | "corporate_office" | "estate";
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_person?: string;
          email?: string;
          phone?: string | null;
          status?: "active" | "inactive";
          type?: "apartment" | "corporate_office" | "estate";
          location?: string | null;
          created_at?: string;
        };
      };
      // Add other table types as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
