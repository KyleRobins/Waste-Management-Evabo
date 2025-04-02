"use client";

import { createClient } from "@/lib/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient();

type WasteRecord = Database["public"]["Tables"]["waste_records"]["Insert"];

interface Coordinates {
  lat: number;
  lng: number;
}

export interface CreateWasteRecordInput {
  date: string;
  type: string;
  quantity: string;
  customer_id: string;
  location: string;
  coordinates: Coordinates;
  status?: "pending" | "completed" | "requires_approval";
}

export const createWasteRecord = async (input: CreateWasteRecordInput) => {
  const { data, error } = await supabase
    .from("waste_records")
    .insert({
      date: input.date,
      type: input.type,
      quantity: input.quantity,
      customer_id: input.customer_id,
      location: input.location,
      coordinates: input.coordinates,
      status: input.status || "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getWasteRecords = async () => {
  const { data, error } = await supabase
    .from("waste_records")
    .select(
      `
      *,
      customer:customers(
        id,
        name,
        type,
        contact_person,
        email,
        location
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateWasteRecord = async (
  id: string,
  updates: Partial<CreateWasteRecordInput>
) => {
  const { data, error } = await supabase
    .from("waste_records")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteWasteRecord = async (id: string) => {
  const { error } = await supabase.from("waste_records").delete().eq("id", id);

  if (error) throw error;
};
