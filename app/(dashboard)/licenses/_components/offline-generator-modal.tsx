"use client"

import { useState } from "react"
import { generateOfflineLicense } from "@/app/actions/licenses"
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

export default function OfflineGeneratorModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [clinicId, setClinicId] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    )
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId || !expiresAt) {
      toast.error("Clinic ID and Expiration Date are required.")
      return
    }

    setIsLoading(true)
    try {
      // Must be formatted to ISO or valid date string for the payload
      const dateIso = new Date(expiresAt).toISOString()
      const fileContent = await generateOfflineLicense(clinicId, features, dateIso)
      
      const blob = new Blob([fileContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `license-${clinicId}.clinicos`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Offline license generated and downloaded!")
      setIsOpen(false)
      // reset form
      setClinicId("")
      setExpiresAt("")
      setFeatures([])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate offline license.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
        Generate Offline License
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
            <div className="p-6 border-b dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Offline License Generator</h3>
              <p className="text-sm text-slate-500 mt-1">Create a .clinicos file for fully offline deployments.</p>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Clinic ID (UUID)</label>
                <input 
                  type="text" 
                  value={clinicId} 
                  onChange={(e) => setClinicId(e.target.value)} 
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-800 dark:border-slate-700"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                      <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
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
                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                  {isLoading ? "Generating..." : "Download File"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
