"use client"

import Link from "next/link"
import { useAuth } from "../context/AuthContext"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { user, role, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  return (
    <nav className="w-full bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">
          BloodLine
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/about">About</Link>
          <Link href="/emergency">Emergency</Link>
          {!user && (
            <>
              <Link
                href="/auth/login"
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-1 rounded border"
              >
                Signup
              </Link>
            </>
          )}
          {user && role === "donor" && (
            <Link href="/donor/dashboard">Donor Dashboard</Link>
          )}
          {user && role === "hospital" && (
            <Link href="/hospital/dashboard">Hospital Dashboard</Link>
          )}
          {user && role === "admin" && (
            <Link href="/admin/dashboard">Admin Dashboard</Link>
          )}
          {user && (
            <>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-red-500 text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
