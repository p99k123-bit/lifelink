"use client"

import { useState, useEffect, useCallback } from "react" // Added useEffect & useCallback
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../components/ToastContext"
import { Button } from "../../components/ui/button" // Ensure this path is correct

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [recentRequests, setRecentRequests] = useState([]) // State for requests
  const { token } = useAuth()
  const toast = useToast()

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

  // 1. Define the refetch function
  const refetch = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/emergency/recent`)
      setRecentRequests(res.data)
    } catch (err) {
      console.error("Failed to refresh requests")
    }
  }, [API_BASE])

  // 2. Fetch data on load
  useEffect(() => {
    refetch()
  }, [refetch])

  const submitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      blood_group: formData.get("blood_group"),
      units: Number(formData.get("units")),
      city: formData.get("city"),
      urgency_level: formData.get("urgency"),
    }

    try {
      await axios.post(
        `${API_BASE}/api/emergency/request`,
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      )

      const successMsg = "Emergency request created successfully 🚑"
      setMessage(successMsg)
      toast?.success?.(successMsg)
      form.reset()
      refetch() // Refresh list after submission
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || "Failed to create emergency request"
      setMessage(errMsg)
      toast?.error?.(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-6">
          Emergency Blood Request
        </h1>

        <form onSubmit={submitRequest} className="space-y-4">
          <select name="blood_group" required className="w-full border p-2 rounded" defaultValue="">
            <option value="" disabled>Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <input name="units" type="number" min={1} required placeholder="Units Required" className="w-full border p-2 rounded" />
          <input name="city" required placeholder="City" className="w-full border p-2 rounded" />

          <select name="urgency" required className="w-full border p-2 rounded" defaultValue="">
            <option value="" disabled>Urgency Level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="critical">Critical</option>
          </select>

          <button disabled={loading} className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
            {loading ? "Submitting..." : "Submit Emergency Request"}
          </button>
        </form>

        {/* The section that was causing the error */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent requests</h3>
            <Button variant="outline" size="sm" onClick={refetch}>Refresh</Button>
          </div>
          
          <div className="mt-4 space-y-2">
            {recentRequests.length === 0 ? (
              <p className="text-xs text-gray-500">No recent requests found.</p>
            ) : (
              recentRequests.map((req: any) => (
                <div key={req.id} className="text-sm p-2 bg-gray-50 rounded border">
                  <span className="font-bold text-red-600">{req.blood_group}</span> needed in {req.city}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
