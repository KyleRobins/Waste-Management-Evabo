"use client";

import { createClient } from "@/lib/supabase/client";
import { Product, ProductWithCustomer } from "@/lib/types/products";

const supabase = createClient();

export async function getProducts(): Promise<ProductWithCustomer[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      customer:customers(id, name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ProductWithCustomer[];
}

export async function getProductById(id: string): Promise<ProductWithCustomer> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      customer:customers(id, name, email)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ProductWithCustomer;
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}

export async function getProductsByCustomerId(
  customerId: string
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Product[];
}
