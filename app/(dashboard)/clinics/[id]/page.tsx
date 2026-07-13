import { createClient } from "@/lib/supabase/server";
import { createOverride, deleteOverride } from "../actions";
import { recordPayment } from "../../payments/actions";
import { getClinicEntitlements } from "@/lib/entitlements";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChangePlanForm } from "./_components/change-plan-form";

export default async function ClinicDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const [
    { data: clinic },
    { data: subscriptions },
    { data: plans },
    { data: overrides },
    { data: features },
    entitlements,
    { data: payments }
  ] = await Promise.all([
    supabase.from("clinics").select("*, clinic_types(name_en)").eq("id", params.id).single(),
    supabase.from("clinic_subscriptions").select("*, plans(name_en)").eq("clinic_id", params.id).order("created_at", { ascending: false }),
    supabase.from("plans").select("id, name_en, price_egp").eq("is_active", true).order("price_egp", { ascending: true }),
    supabase.from("account_feature_overrides").select("*, features(name_en), platform_admins(full_name)").eq("clinic_id", params.id).order("created_at", { ascending: false }),
    supabase.from("features").select("id, name_en, base_price_egp").eq("is_active", true).order("name_en", { ascending: true }),
    getClinicEntitlements(params.id),
    supabase.from("payments").select("*, platform_admins(full_name)").eq("clinic_id", params.id).order("paid_at", { ascending: false })
  ]);

  if (!clinic) return notFound();

  const activeSub = subscriptions?.find(s => s.status === 'active' || s.status === 'trial');
  const pastSubs = subscriptions?.filter(s => s !== activeSub) || [];

  async function handleCreateOverride(formData: FormData) {
    "use server";
    await createOverride(formData);
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/clinics" className="text-sm text-slate-500 hover:text-slate-900">&larr; Back to Clinics</Link>
      </div>
      
      {/* Clinic Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">{clinic.name}</h1>
          <p className="text-slate-600">{clinic.clinic_types?.name_en} • Created {new Date(clinic.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            clinic.status === 'active' ? 'bg-green-100 text-green-700' : 
            clinic.status === 'trial' ? 'bg-blue-100 text-blue-700' : 
            'bg-slate-100 text-slate-700'
          }`}>
            {clinic.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Owner Contact</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <div className="text-slate-500">Full Name</div>
              <div className="font-medium">{clinic.owner_full_name}</div>
            </div>
            <div>
              <div className="text-slate-500">Email</div>
              <div className="font-medium">{clinic.owner_email}</div>
            </div>
            <div>
              <div className="text-slate-500">Phone</div>
              <div className="font-medium">{clinic.owner_phone}</div>
            </div>
          </div>
        </div>

        {/* Current Subscription */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Active Subscription</h2>
          {activeSub ? (
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <div className="text-slate-500">Plan</div>
                  <div className="font-bold text-lg">{activeSub.plans?.name_en}</div>
                </div>
                <div>
                  <div className="text-slate-500">Locked Price</div>
                  <div className="font-medium text-slate-900">{activeSub.price_locked_egp} EGP</div>
                </div>
                <div>
                  <div className="text-slate-500">Period</div>
                  <div className="font-medium">
                    {new Date(activeSub.current_period_start).toLocaleDateString()} &mdash; {new Date(activeSub.current_period_end).toLocaleDateString()}
                  </div>
                </div>
                {activeSub.status === 'trial' && activeSub.trial_ends_at && (
                  <div>
                    <div className="text-slate-500">Trial Ends At</div>
                    <div className="font-medium text-blue-600">{new Date(activeSub.trial_ends_at).toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Change Plan Action */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-[250px]">
                <h3 className="font-semibold text-sm mb-3">Change Plan</h3>
                <ChangePlanForm
                  clinicId={params.id}
                  plans={plans || []}
                  currentPlanId={activeSub.plan_id}
                />
              </div>
            </div>
          ) : (
            <div className="text-slate-500 italic">No active subscription found.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Effective Entitlements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold">Effective Entitlements</h2>
            <p className="text-xs text-slate-500 mt-1">Computed from active plan + overrides.</p>
          </div>
          <div className="p-6 flex-1">
            {entitlements.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {entitlements.map(feature => (
                  <li key={feature.id} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="text-green-500">✓</span> {feature.name_en}
                    {feature.price_addon_egp && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        +{feature.price_addon_egp} EGP addon
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500 italic text-sm">No active features found for this clinic.</div>
            )}
          </div>
        </div>

        {/* Create Override */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold">Add Feature Override</h2>
            <p className="text-xs text-slate-500 mt-1">Grant or revoke specific features for this clinic.</p>
          </div>
          <div className="p-6 flex-1">
            <form action={handleCreateOverride} className="flex flex-col gap-4">
              <input type="hidden" name="clinic_id" value={params.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Type</label>
                  <select name="override_type" required className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm bg-white">
                    <option value="grant">Grant</option>
                    <option value="revoke">Revoke</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Feature</label>
                  <select name="feature_id" required className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm bg-white">
                    <option value="">Select feature...</option>
                    {features?.map(f => (
                      <option key={f.id} value={f.id}>{f.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Add-on Price (EGP)</label>
                  <input type="number" step="0.01" name="price_addon_egp" placeholder="Optional" className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Expires At</label>
                  <input type="datetime-local" name="expires_at" className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm" />
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Note</label>
                <input name="note" placeholder="Reason for override..." className="border border-slate-300 rounded-md px-3 py-2 outline-none text-sm" />
              </div>

              <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 mt-2">
                Save Override
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Feature Overrides List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Active & Historical Overrides</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Feature</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Type</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Addon Price</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Granted By</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Expires</th>
              <th className="px-6 py-3 font-semibold text-slate-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {overrides?.map((override) => {
              const isExpired = override.expires_at && new Date(override.expires_at) < new Date();
              return (
                <tr key={override.id} className={`hover:bg-slate-50 ${isExpired ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {override.features?.name_en}
                    {override.note && <div className="text-xs text-slate-400 font-normal mt-0.5">{override.note}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${override.override_type === 'grant' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {override.override_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{override.price_addon_egp ? `${override.price_addon_egp} EGP` : '-'}</td>
                  <td className="px-6 py-4">{override.platform_admins?.full_name}</td>
                  <td className="px-6 py-4">
                    {override.expires_at ? new Date(override.expires_at).toLocaleString() : 'Never'}
                    {isExpired && <span className="text-red-500 ml-2 font-semibold">(Expired)</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={async () => { "use server"; await deleteOverride(override.id, params.id); }}>
                      <button type="submit" className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!overrides?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No feature overrides exist for this clinic.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payments Ledger Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Payments Ledger</h2>
            <p className="text-xs text-slate-500 mt-1">Record and view manual payments.</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <form action={async (formData: FormData) => { "use server"; await recordPayment(formData); }} className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
            <input type="hidden" name="clinic_id" value={params.id} />
            <input type="hidden" name="subscription_id" value={activeSub?.id || ""} />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Amount (EGP)</label>
              <input type="number" step="0.01" name="amount_egp" required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm" />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Method</label>
              <select name="payment_method" required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="vodafone_cash">Vodafone Cash</option>
                <option value="instapay">Instapay</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Status</label>
              <select name="status" required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white">
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Reference Note</label>
              <input type="text" name="reference_note" placeholder="Optional" className="border border-slate-300 rounded-md px-3 py-1.5 text-sm" />
            </div>

            <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-green-700">
              Record Payment
            </button>
          </form>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Amount</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Method</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Reference</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Recorded By</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold">{payment.amount_egp} EGP</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                    {payment.payment_method.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    payment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                    payment.status === 'failed' ? 'bg-red-100 text-red-700' : 
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">{payment.reference_note || '-'}</td>
                <td className="px-6 py-4">{payment.platform_admins?.full_name}</td>
                <td className="px-6 py-4">{new Date(payment.paid_at).toLocaleString()}</td>
              </tr>
            ))}
            {!payments?.length && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No payments recorded for this clinic.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Subscription History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Subscription History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Plan</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Locked Price</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Period Start</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Period End</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pastSubs.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 opacity-70">
                <td className="px-6 py-4 font-medium text-slate-900">{sub.plans?.name_en}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">{sub.price_locked_egp} EGP</td>
                <td className="px-6 py-4">{new Date(sub.current_period_start).toLocaleDateString()}</td>
                <td className="px-6 py-4">{new Date(sub.current_period_end).toLocaleDateString()}</td>
              </tr>
            ))}
            {!pastSubs.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No historical subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
