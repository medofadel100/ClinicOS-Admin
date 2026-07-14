"use client";

import { useState } from "react";
import { updateClinicType } from "../actions";
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
export function ClinicTypeRow({ type }: { type: any }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <tr className="bg-indigo-50/50">
        <td colSpan={5} className="px-6 py-4">
          <form 
            action={async (formData) => {
              await updateClinicType(type.id, formData);
              setIsEditing(false);
            }}
            className="flex flex-col gap-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Name (English)</label>
                <input name="name_en" defaultValue={type.name_en} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Name (Arabic)</label>
                <input name="name_ar" defaultValue={type.name_ar} required className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm text-right" dir="rtl" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-500">Description</label>
                <input name="description" defaultValue={type.description || ''} className="border border-slate-300 rounded-md px-2 py-1 outline-none text-sm" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input type="checkbox" id={`active-${type.id}`} name="is_active" value="true" defaultChecked={type.is_active} className="rounded" />
                <label htmlFor={`active-${type.id}`} className="text-sm font-medium">Is Active</label>
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
      <td className="px-6 py-4 font-mono text-slate-700">{type.code}</td>
      <td className="px-6 py-4 font-medium text-slate-900">{type.name_en}</td>
      <td className="px-6 py-4 text-slate-600">{type.name_ar}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {type.is_active ? "Active" : "Disabled"}
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
