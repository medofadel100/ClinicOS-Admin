"use client";

import { useState } from "react";
import { updateFeature } from "../actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-indigo-600 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FeatureRow({ feature }: { feature: any }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <tr className="bg-indigo-50/50">
        <td colSpan={6} className="px-6 py-4">
          <form 
            action={async (formData) => {
              await updateFeature(feature.id, formData);
              setIsEditing(false);
            }}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Name (English)</label>
                <input name="name_en" defaultValue={feature.name_en} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Name (Arabic)</label>
                <input name="name_ar" defaultValue={feature.name_ar} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm text-right" dir="rtl" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Category</label>
                <input name="category" defaultValue={feature.category} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Base Price (EGP)</label>
                <input name="base_price_egp" type="number" step="0.01" defaultValue={feature.base_price_egp || ''} className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-medium text-slate-500">Description (English)</label>
                <input name="description_en" defaultValue={feature.description_en || ''} className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-medium text-slate-500">Description (Arabic)</label>
                <input name="description_ar" defaultValue={feature.description_ar || ''} className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm text-right" dir="rtl" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input type="checkbox" id={`active-${feature.id}`} name="is_active" value="true" defaultChecked={feature.is_active} className="rounded" />
                <label htmlFor={`active-${feature.id}`} className="text-sm font-medium">Is Active</label>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <SubmitButton />
              </div>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 font-mono text-slate-700">{feature.code}</td>
      <td className="px-6 py-4 font-medium text-slate-900">{feature.name_en}</td>
      <td className="px-6 py-4 text-slate-600">{feature.category}</td>
      <td className="px-6 py-4 text-slate-600">{feature.base_price_egp !== null ? `${feature.base_price_egp} EGP` : 'Included'}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${feature.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {feature.is_active ? "Active" : "Disabled"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button 
          onClick={() => setIsEditing(true)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
