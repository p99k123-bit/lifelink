"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useToast } from "../../components/ToastContext"

type EmergencyRequest = {
  id: string
  blood_group: string
  units: number
  city: string
  urgency_level: string
  created_at: string
}

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [requests, setRequests] = useState<EmergencyRequest[]>([])
  const toast = useToast()

  /* ========== SUBMIT REQUEST ========== */
  const submitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const form = e.currentTarget

    const payload = {
      blood_group: (form.elements.namedItem("blood_group") as HTMLSelectElement).value,
      units: Number((form.elements.namedItem("units") as HTMLInputElement).value),
      city: (form.elements.namedItem("city") as HTMLInputElement).value,
      urgency_level: (form.elements.namedItem("urgency") as HTMLSelectElement).value,
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast?.error?.("Please login first")
      setLoading(false)
      return
    }

    const { error } = await supabase.from("emergency_requests").insert({
      ...payload,
      user_id: user.id,
    })

    if (error) {
      toast?.error?.(error.message)
    } else {
      toast?.success?.("Emergency request created 🚑")
      setMessage("Emergency request created successfully 🚑")
      form.reset()
      fetchRequests()
    }

    setLoading(false)
  }

  /* ========== FETCH REQUESTS ========== */
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
  }

  return (
    <main className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-6">
          Emergency Blood Request
        </h1>

        <form onSubmit={submitRequest} className="space-y-4">
          <select name="blood_group" required className="w-full border p-2 rounded">
            <option value="">Select Blood Group</option>
            <option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option>
            <option>O+</option><option>O-</option>
            <option>AB+</option><option>AB-</option>
          </select>

          <input name="units" type="number" min={1} required placeholder="Units" className="w-full border p-2 rounded" />
          <input name="city" required placeholder="City" className="w-full border p-2 rounded" />

          <select name="urgency" required className="w-full border p-2 rounded">
            <option value="">Urgency</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="critical">Critical</option>
          </select>

          <button disabled={loading} className="w-full bg-red-600 text-white py-2 rounded">
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </main>
  )
}
