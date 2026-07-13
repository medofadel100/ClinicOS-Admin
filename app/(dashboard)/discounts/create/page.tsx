"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDiscountCode } from "@/app/actions/discounts";

export default function CreateDiscountPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const discount_type = formData.get("discount_type") as "percentage" | "fixed_amount";
    const discount_value = Number(formData.get("discount_value"));
    const applies_to = formData.get("applies_to") as "new_subscription" | "renewal" | "both";
    const valid_until_str = formData.get("valid_until") as string;
    const valid_until = valid_until_str ? new Date(valid_until_str).toISOString() : null;
    const max_uses_str = formData.get("max_uses") as string;
    const max_uses = max_uses_str ? Number(max_uses_str) : null;

    if (!code || !discount_value) {
      setError("Code and Value are required.");
      return;
    }

    startTransition(async () => {
      try {
        await createDiscountCode({
          code: code.toUpperCase(),
          description: description || null,
          discount_type,
          discount_value,
          applies_to,
          valid_until,
          max_uses,
          is_active: true,
          times_used: 0,
        });
        router.push("/discounts");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create discount code");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create Discount Code</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Code</label>
            <input
              type="text"
              name="code"
              placeholder="e.g. SUMMER20"
              required
              className="border border-slate-300 rounded-md px-3 py-2 uppercase focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Applies To</label>
            <select
              name="applies_to"
              className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="both">Both New & Renewal</option>
              <option value="new_subscription">New Subscriptions Only</option>
              <option value="renewal">Renewals Only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Description (Internal)</label>
          <input
            type="text"
            name="description"
            placeholder="Campaign notes..."
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Type</label>
            <select
              name="discount_type"
              className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount (EGP)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Value</label>
            <input
              type="number"
              name="discount_value"
              step="0.01"
              min="0"
              required
              placeholder="20"
              className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Valid Until (Optional)</label>
            <input
              type="datetime-local"
              name="valid_until"
              className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Max Uses (Optional)</label>
            <input
              type="number"
              name="max_uses"
              min="1"
              placeholder="Unlimited"
              className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium mr-4"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create Discount Code"}
          </button>
        </div>
      </form>
    </div>
  );
}
