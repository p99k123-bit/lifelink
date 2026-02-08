'use client'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { ToastProvider } from '../components/ToastContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <html lang="en">
          <body className="min-h-screen bg-gray-50 text-slate-900">
            <div>
              <Navbar />
              <main className="container mx-auto px-4 py-6">{children}</main>
            </div>
          </body>
        </html>
      </ToastProvider>
    </AuthProvider>
  )
}
