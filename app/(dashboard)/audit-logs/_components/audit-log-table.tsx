"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Database } from "@/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n/context";

export function AuditLogTable({
  logs,
  totalPages,
  currentPage,
  admins,
}: {
  logs: (Database["public"]["Tables"]["audit_log"]["Row"] & { platform_admins: { full_name: string } | null })[];
  totalPages: number;
  currentPage: number;
  admins: { id: string; full_name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const handleFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Select
          value={searchParams.get("target_table") || "all"}
          onValueChange={(val) => handleFilter("target_table", val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByTable")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTables")}</SelectItem>
            <SelectItem value="clinic_subscriptions">{t("subscriptions")}</SelectItem>
            <SelectItem value="payments">{t("payments")}</SelectItem>
            <SelectItem value="account_feature_overrides">{t("overrides")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("actor_admin_id") || "all"}
          onValueChange={(val) => handleFilter("actor_admin_id", val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByAdmin")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allAdmins")}</SelectItem>
            {admins.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("actor")}</TableHead>
              <TableHead>{t("action")}</TableHead>
              <TableHead>{t("target")}</TableHead>
              <TableHead>{t("details")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t("noAuditLogs")}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(log.created_at), "PP p")}
                  </TableCell>
                  <TableCell>
                    {log.platform_admins?.full_name || t("system")}
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground block">{log.target_table}</span>
                    <span className="text-xs font-mono">{log.target_id.slice(0, 8)}...</span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger className="text-sm font-medium text-indigo-600 hover:underline">
                        {t("viewDetails")}
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("auditLogDetails")}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t("oldValue")}</h4>
                            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
                              {log.old_value ? JSON.stringify(log.old_value, null, 2) : "null"}
                            </pre>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">{t("newValue")}</h4>
                            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
                              {log.new_value ? JSON.stringify(log.new_value, null, 2) : "null"}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            {t("previous")}
          </Button>
          <div className="text-sm text-muted-foreground">
            {t("pageOf")} {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
}
