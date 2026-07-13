"use server";

import { createClient } from "@/lib/supabase/server";

export type AuditLogFilter = {
  actor_admin_id?: string;
  target_table?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
};

export async function getAuditLogs(
  page: number = 1,
  pageSize: number = 20,
  filters?: AuditLogFilter
) {
  const supabase = createClient();
  
  let query = supabase
    .from("audit_log")
    .select(`
      *,
      platform_admins (
        id,
        full_name
      )
    `, { count: "exact" });

  if (filters?.actor_admin_id) {
    query = query.eq("actor_admin_id", filters.actor_admin_id);
  }
  if (filters?.target_table && filters.target_table !== "all") {
    query = query.eq("target_table", filters.target_table);
  }
  if (filters?.action) {
    query = query.ilike("action", `%${filters.action}%`);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;
  
  return {
    data,
    count: count || 0,
    page,
    pageSize,
    totalPages: count ? Math.ceil(count / pageSize) : 0,
  };
}

export async function getAdminsForFilter() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("platform_admins")
    .select("id, full_name")
    .order("full_name");
  if (error) throw error;
  return data;
}
