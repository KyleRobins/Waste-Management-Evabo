"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export interface Customer {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  status: "active" | "inactive";
  type: "apartment" | "corporate_office" | "estate";
  location: string | null;
  created_at: string;
}

export type CreateCustomerInput = Omit<Customer, "id" | "created_at">;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select()
      .order("name");

    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }

    return (data || []) as unknown as Customer[];
  } catch (error) {
    console.error("Error in getCustomers:", error);
    return [];
  }
}

export async function createCustomer(customer: CreateCustomerInput) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .insert([customer as any])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
}

export async function updateCustomer(id: string, updates: UpdateCustomerInput) {
  try {
    const { data, error } = await supabase
      .from("customers")
      .update(updates as any)
      .eq("id", id as any)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Customer;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
}

export async function deleteCustomer(id: string) {
  try {
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id as any);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
}
