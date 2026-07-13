import { getDiscountCodes } from "@/app/actions/discounts";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DiscountToggle } from "./_components/discount-toggle";
import { createClient } from "@/lib/supabase/server";

export default async function DiscountsPage() {
  const codes = await getDiscountCodes();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: admin } = await supabase.from("platform_admins").select("role").eq("auth_user_id", user?.id || "").single();

  const canEdit = admin?.role === "super_admin" || admin?.role === "accountant";

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Discount Codes</h1>
          <p className="text-slate-600">Manage promotional codes for clinic subscriptions.</p>
        </div>
        {canEdit && (
          <Link
            href="/discounts/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            Create Discount Code
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type & Value</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-8 text-slate-500">
                  No discount codes found.
                </TableCell>
              </TableRow>
            ) : (
              codes.map((code) => {
                const isExpired = code.valid_until && new Date(code.valid_until) < new Date();
                const isMaxedOut = code.max_uses !== null && code.times_used >= code.max_uses;
                const isUsable = code.is_active && !isExpired && !isMaxedOut;

                return (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="font-mono font-bold text-slate-900">{code.code}</div>
                      <div className="text-xs text-slate-500 mt-1">{code.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {code.discount_type === "percentage"
                          ? `${code.discount_value}% OFF`
                          : `${code.discount_value} EGP OFF`}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {code.applies_to.replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {code.times_used} {code.max_uses ? `/ ${code.max_uses}` : "uses"}
                      </div>
                      {isMaxedOut && (
                        <div className="text-xs text-red-500 font-medium">Limit reached</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <span className="text-slate-500">From:</span> {format(new Date(code.valid_from), "PP")}
                      </div>
                      <div className="text-xs mt-1">
                        <span className="text-slate-500">To:</span> {code.valid_until ? format(new Date(code.valid_until), "PP") : "Forever"}
                      </div>
                      {isExpired && (
                        <div className="text-xs text-red-500 font-medium mt-1">Expired</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isUsable
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {isUsable ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <DiscountToggle id={code.id} isActive={code.is_active} />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
