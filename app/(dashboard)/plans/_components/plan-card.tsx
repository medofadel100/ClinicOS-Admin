"use client";

import { useState } from "react";
import { updatePlan } from "../actions";
import Link from "next/link";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PlanCard({ plan }: { plan: any }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <h3 className="font-semibold mb-4 text-slate-800">Edit Plan: {plan.code}</h3>
        <form 
          action={async (formData) => {
            await updatePlan(plan.id, formData);
            setIsEditing(false);
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Name (English)</label>
            <input name="name_en" defaultValue={plan.name_en} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Name (Arabic)</label>
            <input name="name_ar" defaultValue={plan.name_ar} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm text-right" dir="rtl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Price (EGP)</label>
              <input name="price_egp" type="number" step="0.01" defaultValue={plan.price_egp} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Billing Cycle</label>
              <select name="billing_cycle" defaultValue={plan.billing_cycle} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm bg-white">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" id={`active-${plan.id}`} name="is_active" value="true" defaultChecked={plan.is_active} className="rounded" />
            <label htmlFor={`active-${plan.id}`} className="text-sm font-medium">Is Active</label>
          </div>
          
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
      {!plan.is_active && (
        <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
          Disabled
        </div>
      )}
      
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xl font-bold text-slate-900">{plan.name_en} / {plan.name_ar}</h3>
        <button 
          onClick={() => setIsEditing(true)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Edit
        </button>
      </div>
      
      <div className="font-mono text-sm text-slate-500 mb-4">{plan.code}</div>
      
      <div className="text-3xl font-bold mb-4">
        {plan.price_egp} <span className="text-lg font-normal text-slate-500">EGP / {plan.billing_cycle}</span>
      </div>

      <div className="flex-1">
        <h4 className="font-semibold text-slate-800 mb-2 border-b pb-1">Limits</h4>
        <ul className="text-sm text-slate-600 flex flex-col gap-1 mb-4">
          {plan.plan_limits.map((limit: {id: string, limit_type: string, max_value: number | null}) => (
            <li key={limit.id} className="flex justify-between">
              <span className="capitalize">{limit.limit_type.replace('_', ' ')}:</span>
              <span className="font-medium text-slate-900">{limit.max_value === null ? 'Unlimited' : limit.max_value}</span>
            </li>
          ))}
          {plan.plan_limits.length === 0 && <li className="italic">No limits defined</li>}
        </ul>

        <h4 className="font-semibold text-slate-800 mb-2 border-b pb-1">Features</h4>
        <div className="text-sm text-slate-600 mb-6">
          {plan.plan_features.length} features assigned
        </div>
      </div>
      
      <div className="mt-auto border-t border-slate-100 pt-4">
        <Link 
          href={`/plans/${plan.id}`}
          className="block w-full text-center bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-md font-medium hover:bg-slate-100 transition-colors"
        >
          Manage Limits & Features
        </Link>
      </div>
    </div>
  );
}
