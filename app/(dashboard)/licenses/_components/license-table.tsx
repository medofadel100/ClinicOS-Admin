"use client"

import { useState } from "react"
import { format } from "date-fns"
import { revokeLicense, approvePayment, updateSerial } from "@/app/actions/licenses"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import toast from "react-hot-toast"

type License = {
  id: string
  serial_code: string
  status: string
  license_version: number
  expires_at?: string | null
  trial_expires_at?: string | null
  clinics?: { name: string; email: string } | null
}

export default function LicenseTable({ initialData }: { initialData: License[] }) {
  const [licenses, setLicenses] = useState<License[]>(initialData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSerialCode, setEditSerialCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this license? This will lock the user out upon next sync.")) return
    setIsLoading(true)
    try {
      await revokeLicense(id)
      setLicenses(licenses.map(l => l.id === id ? { ...l, status: "revoked", license_version: l.license_version + 1 } : l))
      toast.success("License revoked successfully")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setIsLoading(true)
    try {
      await approvePayment(id)
      setLicenses(licenses.map(l => l.id === id ? { ...l, status: "active", license_version: l.license_version + 1 } : l))
      toast.success("Payment approved. License is now active.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSerial = async (id: string) => {
    if (!editSerialCode) return
    setIsLoading(true)
    try {
      await updateSerial(id, editSerialCode)
      setLicenses(licenses.map(l => l.id === id ? { ...l, serial_code: editSerialCode, license_version: l.license_version + 1 } : l))
      setEditingId(null)
      toast.success("Serial updated and payload signed.")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50 dark:bg-slate-900/50">
          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Serial Code</TableHead>
          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Clinic / Admin</TableHead>
          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Version</TableHead>
          <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Expires At</TableHead>
          <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {licenses.map((license) => (
          <TableRow key={license.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <TableCell className="font-mono text-sm font-medium">
              {editingId === license.id ? (
                <div className="flex gap-2 items-center">
                  <input 
                    className="border px-3 py-1.5 rounded-md w-full text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-slate-900 dark:border-slate-700" 
                    value={editSerialCode} 
                    onChange={e => setEditSerialCode(e.target.value)} 
                  />
                  <Button size="sm" onClick={() => handleSaveSerial(license.id)} disabled={isLoading} className="h-8">Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">Cancel</Button>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="truncate max-w-[180px]" title={license.serial_code}>{license.serial_code}</span>
                  <button onClick={() => {
                    setEditingId(license.id)
                    setEditSerialCode(license.serial_code)
                  }} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs font-semibold">Edit</button>
                </span>
              )}
            </TableCell>
            <TableCell>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                license.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                license.status === 'trial' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                license.status === 'revoked' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' :
                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}>
                {license.status.toUpperCase()}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium text-slate-900 dark:text-white">{license.clinics?.name || "Unknown Clinic"}</span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">{license.clinics?.email || "No Email"}</span>
              </div>
            </TableCell>
            <TableCell>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-medium">v{license.license_version}</span>
            </TableCell>
            <TableCell className="text-slate-600 dark:text-slate-300">
              {format(new Date(license.expires_at || license.trial_expires_at || new Date()), "MMM d, yyyy")}
            </TableCell>
            <TableCell className="text-right space-x-2">
              {license.status === 'trial' && (
                <Button size="sm" variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40" onClick={() => handleApprove(license.id)} disabled={isLoading}>
                  Approve
                </Button>
              )}
              {license.status !== 'revoked' && (
                <Button size="sm" variant="destructive" onClick={() => handleRevoke(license.id)} disabled={isLoading} className="bg-rose-600 hover:bg-rose-700 text-white">
                  Revoke
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
        {licenses.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-slate-500 dark:text-slate-400 py-12">
              No licenses found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
