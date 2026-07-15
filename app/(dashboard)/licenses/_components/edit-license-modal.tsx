"use client"

import { useState, useEffect } from "react"
import { updateLicense } from "@/app/actions/licenses"
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

type License = {
  id: string
  serial_code: string
  expires_at?: string | null
  trial_expires_at?: string | null
  signed_payload?: string
}

export default function EditLicenseModal({ 
  license, 
  isOpen, 
  onClose 
}: { 
  license: License | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const [serialCode, setSerialCode] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (license && isOpen) {
      setSerialCode(license.serial_code)
      
      const dateStr = license.expires_at || license.trial_expires_at
      if (dateStr) {
        setExpiresAt(new Date(dateStr).toISOString().split('T')[0])
      } else {
        setExpiresAt("")
      }

      // Extract existing features if possible
      let initialFeatures: string[] = []
      if (license.signed_payload) {
        try {
          const parsed = JSON.parse(license.signed_payload)
          if (parsed.payload && Array.isArray(parsed.payload.features)) {
            initialFeatures = parsed.payload.features
          }
        } catch {
          console.error("Failed to parse signed_payload for features")
        }
      }
      setFeatures(initialFeatures)
    }
  }, [license, isOpen])

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    )
  }

  const handleGenerateCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    setSerialCode(randomCode)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!license) return
    if (!expiresAt || !serialCode) {
      toast.error("Serial Code and Expiration Date are required.")
      return
    }

    setIsLoading(true)
    try {
      const dateIso = new Date(expiresAt).toISOString()
      await updateLicense(license.id, serialCode, dateIso, features)
      
      toast.success("License updated! Version incremented.")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update license.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !license) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit License</h3>
          <p className="text-sm text-slate-500 mt-1">Update license payload and serial code.</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
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
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {isLoading ? "Saving..." : "Save License"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
