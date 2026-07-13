"use client";

import { useState, useTransition } from "react";
import { changeClinicPlan } from "../../actions";

export function ChangePlanForm({
  clinicId,
  plans,
  currentPlanId,
}: {
  clinicId: string;
  plans: { id: string; name_en: string; price_egp: number }[];
  currentPlanId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [discountCode, setDiscountCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const planId = formData.get("plan_id") as string;
    const discountStr = formData.get("discount_code") as string;

    startTransition(async () => {
      const result = await changeClinicPlan(clinicId, planId, discountStr);
      if (result.error) {
        setError(result.error);
      } else {
        setDiscountCode("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && <div className="text-red-600 text-xs font-medium">{error}</div>}
      
      <select
        name="plan_id"
        required
        className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm bg-white"
        defaultValue={currentPlanId}
      >
        {plans?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name_en} - {p.price_egp} EGP
          </option>
        ))}
      </select>
      
      <input
        type="text"
        name="discount_code"
        placeholder="Discount Code (Optional)"
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm uppercase"
      />
      
      <button
        type="submit"
        disabled={isPending}
        className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Update Plan"}
      </button>
      <p className="text-xs text-slate-500 mt-1">
        This will cancel the current subscription and start a new one.
      </p>
    </form>
  );
}
