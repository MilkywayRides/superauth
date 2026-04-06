'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1]

    if (!userCookie) {
      router.push('/')
      return
    }

    try {
      setUser(JSON.parse(decodeURIComponent(userCookie)))
    } catch (error) {
      router.push('/')
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Demo App</h1>
            </div>
            <div className="flex items-center">
              <a
                href="/auth/logout"
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              You've successfully authenticated using bLAZEnEURO OAuth
            </p>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Profile
              </h3>
              <div className="space-y-3">
                {user.picture && (
                  <div className="flex items-center">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="h-16 w-16 rounded-full"
                    />
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">User ID:</span>
                  <p className="text-gray-900">{user.sub}</p>
                </div>
                {user.name && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-gray-900">{user.name}</p>
                  </div>
                )}
                {user.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{user.email}</p>
                    {user.email_verified && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Raw User Data
              </h3>
              <pre className="bg-gray-50 rounded-lg p-4 overflow-auto text-sm">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
