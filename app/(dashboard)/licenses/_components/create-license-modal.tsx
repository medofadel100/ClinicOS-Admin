"use client"

import { useState } from "react"
import { createLicense } from "@/app/actions/licenses"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

const AVAILABLE_FEATURES = [
  'appointment_booking',
  'patient_management',
  'financial_reports_advanced',
  'whatsapp_ai_bot',
  'offline_desktop_app',
  'clinic_website'
]

type Clinic = {
  id: string
  name: string
}

export default function CreateLicenseModal({ clinics }: { clinics: Clinic[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [clinicId, setClinicId] = useState("")
  const [serialCode, setSerialCode] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    )
  }

  const handleGenerateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    setSerialCode(randomCode)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId || !expiresAt || !serialCode) {
      toast.error("Clinic, Serial Code, and Expiration Date are required.")
      return
    }

    setIsLoading(true)
    try {
      const dateIso = new Date(expiresAt).toISOString()
      await createLicense(clinicId, serialCode, dateIso, features)
      
      toast.success("License created successfully!")
      setIsOpen(false)
      // reset form
      setClinicId("")
      setSerialCode("")
      setExpiresAt("")
      setFeatures([])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create license.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
        + Create New License
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
            <div className="p-6 border-b dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New License</h3>
              <p className="text-sm text-slate-500 mt-1">Generate a new license payload and serial code.</p>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Clinic</label>
                <select 
                  value={clinicId} 
                  onChange={(e) => setClinicId(e.target.value)} 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                  required
                >
                  <option value="">Select a clinic...</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Serial Code</span>
                  <button type="button" onClick={handleGenerateCode} className="text-blue-600 hover:underline text-xs">Generate</button>
                </label>
                <input 
                  type="text" 
                  value={serialCode} 
                  onChange={(e) => setSerialCode(e.target.value)} 
                  placeholder="XXXX-YYYY"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700 uppercase"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expiration Date</label>
                <input 
                  type="date" 
                  value={expiresAt} 
                  onChange={(e) => setExpiresAt(e.target.value)} 
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
                  required
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enabled Features</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                  {AVAILABLE_FEATURES.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 border-2 rounded-sm border-slate-300 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors dark:border-slate-600"></div>
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end space-x-3">
                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                  {isLoading ? "Creating..." : "Create License"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
