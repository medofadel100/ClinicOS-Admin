import { Metadata } from "next";
import { getAuditLogs, getAdminsForFilter } from "@/app/actions/audit";
import { AuditLogTable } from "./_components/audit-log-table";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuditLogsClient } from "./_components/audit-logs-client";

export const metadata: Metadata = {
  title: "Audit Logs - ClinicOS",
};

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const { data: adminData } = await supabase
    .from("platform_admins")
    .select("role")
    .eq("auth_user_id", authData.user.id)
    .single();

  if (!adminData || (adminData.role !== "super_admin" && adminData.role !== "accountant")) {
    redirect("/");
  }

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  const target_table = typeof searchParams.target_table === "string" ? searchParams.target_table : undefined;
  const actor_admin_id = typeof searchParams.actor_admin_id === "string" ? searchParams.actor_admin_id : undefined;
  
  const [logsResponse, admins] = await Promise.all([
    getAuditLogs(page, 20, { target_table, actor_admin_id }),
    getAdminsForFilter()
  ]);

  return (
    <AuditLogsClient>
      <AuditLogTable 
        logs={logsResponse.data || []} 
        totalPages={logsResponse.totalPages} 
        currentPage={page} 
        admins={admins || []}
      />
    </AuditLogsClient>
  );
}
