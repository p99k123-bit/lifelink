'use client'

import { useEffect, useState } from 'react'
import { emergencyApi } from '../lib/api'

export default function useFetchEmergencyRequests(params?: any) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const fetchData = () => {
    let mounted = true
    setLoading(true)

    emergencyApi
      .list()
      .then((res: any) => {
        if (mounted) setData(res || [])
      })
      .catch((err) => {
        if (mounted) setError(err)
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)])

  return {
    data,
    loading,
    error,
    refetch: fetchData, // ✅ ONLY ADDITION
  }
}
