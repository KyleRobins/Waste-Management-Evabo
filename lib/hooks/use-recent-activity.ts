"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Define the types for activities
export interface Activity {
  id: string;
  type: 'waste_record' | 'supplier' | 'customer' | 'product';
  action: string;
  details: string;
  created_at: string;
  user: {
    name: string;
    initials: string;
  };
}

export function useRecentActivity(limit: number = 3) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent waste records
      const { data: wasteRecords } = await supabase
        .from('waste_records')
        .select(`
          id,
          type,
          quantity,
          created_at,
          supplier:suppliers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Fetch recent suppliers
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Fetch recent customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Fetch recent products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine and sort all activities
      const allActivities: Activity[] = [
        ...(wasteRecords?.map(record => ({
          id: record.id,
          type: 'waste_record' as const,
          action: 'collected',
          details: `${record.quantity}kg of ${record.type} waste from ${record.supplier?.name}`,
          created_at: record.created_at,
          user: {
            name: 'System',
            initials: 'SY'
          }
        })) || []),
        ...(suppliers?.map(supplier => ({
          id: supplier.id,
          type: 'supplier' as const,
          action: 'registered',
          details: `new supplier: ${supplier.name}`,
          created_at: supplier.created_at,
          user: {
            name: 'System',
            initials: 'SY'
          }
        })) || []),
        ...(customers?.map(customer => ({
          id: customer.id,
          type: 'customer' as const,
          action: 'registered',
          details: `new customer: ${customer.name}`,
          created_at: customer.created_at,
          user: {
            name: 'System',
            initials: 'SY'
          }
        })) || []),
        ...(products?.map(product => ({
          id: product.id,
          type: 'product' as const,
          action: 'added',
          details: `new product: ${product.name}`,
          created_at: product.created_at,
          user: {
            name: 'System',
            initials: 'SY'
          }
        })) || [])
      ].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, limit);

      setActivities(allActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, [limit]);

  const refresh = () => {
    setLoading(true);
    fetchRecentActivities();
  };

  return {
    activities,
    loading,
    refresh
  };
} 