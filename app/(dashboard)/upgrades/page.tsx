import { createClient } from "@/lib/supabase/server";
import { updateRequestStatus } from "./actions";

interface SearchParams {
  status?: string;
}

export default async function UpgradesPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  let activeStatus: "open" | "contacted" | "resolved" = "open";
  if (searchParams.status === "contacted" || searchParams.status === "resolved") {
    activeStatus = searchParams.status;
  }

  // Fetch upgrade requests
  const { data: requests, error } = await supabase
    .from("upgrade_requests")
    .select(`
      id,
      requested_by_name,
      message,
      status,
      created_at,
      clinics (
        name
      ),
      features (
        name_en,
        name_ar
      )
    `)
    .eq("status", activeStatus)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching upgrades:", error.message);
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Upgrade Requests</h1>
        <p className="text-slate-600">Review requests from clinics trying to access locked features.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <a 
          href="?status=open" 
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeStatus === "open" 
              ? "border-slate-900 text-slate-900" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Open Requests
        </a>
        <a 
          href="?status=contacted" 
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeStatus === "contacted" 
              ? "border-slate-900 text-slate-900" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Contacted
        </a>
        <a 
          href="?status=resolved" 
          className={`px-5 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeStatus === "resolved" 
              ? "border-slate-900 text-slate-900" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Resolved
        </a>
      </div>

      <div className="flex flex-col gap-4">
        {requests?.map((req) => {
          const clinicData = req.clinics as unknown as { name: string } | null;
          const featureData = req.features as unknown as { name_en: string; name_ar: string } | null;
          
          return (
            <div key={req.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {clinicData ? clinicData.name : "Unknown Clinic"}
                  </h3>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-mono">
                    Locked Feature: {featureData ? featureData.name_en : "General Upgrade"}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  {req.message || "No message provided."}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Requested by: <strong className="text-slate-600">{req.requested_by_name || "Unknown"}</strong></span>
                  <span>•</span>
                  <span>Date: {new Date(req.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Update Form */}
              <form action={async (formData) => {
                "use server";
                await updateRequestStatus(formData);
              }} className="flex items-center gap-2">
                <input type="hidden" name="request_id" value={req.id} />
                <select 
                  name="status"
                  defaultValue={req.status}
                  className="border border-slate-200 rounded px-2 py-1.5 text-sm bg-slate-50 outline-none focus:border-slate-400"
                >
                  <option value="open">Open</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button type="submit" className="bg-slate-900 text-white text-xs px-3 py-2 rounded font-medium hover:bg-slate-800 transition-colors">
                  Update
                </button>
              </form>
            </div>
          );
        })}
        {!requests?.length && (
          <div className="bg-white p-12 text-center border border-slate-200 rounded-xl text-slate-500">
            No upgrade requests in this status.
          </div>
        )}
      </div>
    </div>
  );
}
