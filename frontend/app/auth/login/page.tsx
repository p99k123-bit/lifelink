"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../../frontend/context/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await login(email, password)
      console.log("Post-login role:", r)
      if (r === "donor") router.push("/donor/dashboard")
      else if (r === "hospital") router.push("/hospital/dashboard")
      else if (r === "admin") router.push("/admin/dashboard")
      else router.push("/")
    } catch (err: any) {
      console.error("Login failed:", err)
      setErrorMsg(err?.message || String(err))
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
      <form onSubmit={handle} className="space-y-4">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </form>
    </div>
  )
}
