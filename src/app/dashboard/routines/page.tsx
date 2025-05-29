// app/dashboard/routines/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/app/components/layout/DashboardLayout'
import { RoutineCard } from '@/app/components/routines/RoutineCard'
import { RoutineForm } from '@/app/components/routines/RoutineForm'
import { useToast } from '@/app/hooks/use-toast'
import { useRealTimeUpdates } from '@/app/hooks/useRealTimeUpdates'
import { Routine } from '@/app/types'

const getDayOfWeek = (date: Date): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[date.getDay()] as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [filteredRoutines, setFilteredRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()

  // Real-time updates hook
  useRealTimeUpdates<Routine>('routine', {
    onUpdate: (data: Routine) => {
      setRoutines(prev => prev.map(routine => 
        routine.id === data.id ? data : routine
      ))
    },
    onDelete: (data: { id: string }) => {
      setRoutines(prev => prev.filter(routine => routine.id !== data.id))
    },
    onInsert: (data: Routine) => {
      setRoutines(prev => [...prev, data])
    }
  })

  // Fetch routines
  useEffect(() => {
    fetchRoutines()
  }, [])

  // Filter routines based on active tab
  useEffect(() => {
    filterRoutines()
  }, [routines, activeTab])

  const fetchRoutines = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/routines')
      
      if (!response.ok) {
        throw new Error('Failed to fetch routines')
      }

      const data = await response.json()
      setRoutines(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: "Error",
        description: "Failed to load routines",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRoutines = () => {
    const now = new Date()
    const currentDay = getDayOfWeek(now)

    let filtered = [...routines]

    switch (activeTab) {
      case 'today':
        filtered = routines.filter(routine => {
          if (routine.daysOfWeek && routine.daysOfWeek.includes(currentDay)) {
            return true
          }
          return false
        })
        break
      case 'morning':
        filtered = routines.filter(routine => {
          const time = routine.time?.split(':')[0]
          return time && parseInt(time) < 12
        })
        break
      case 'evening':
        filtered = routines.filter(routine => {
          const time = routine.time?.split(':')[0]
          return time && parseInt(time) >= 17
        })
        break
      case 'active':
        filtered = routines.filter(routine => routine.isActive)
        break
    }

    setFilteredRoutines(filtered)
  }

  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to create routine')
      }

      const newRoutine = await response.json()
      setRoutines(prev => [...prev, newRoutine])
      setIsCreateDialogOpen(false)
      
      toast({
        title: "Success",
        description: "Routine created successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create routine",
        variant: "destructive"
      })
    }
  }

  const handleUpdate = async (id: string, data: Partial<Routine>) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to update routine')
      }

      const updatedRoutine = await response.json()
      setRoutines(prev => prev.map(routine => 
        routine.id === id ? updatedRoutine : routine
      ))
      setEditingRoutine(null)
      
      toast({
        title: "Success",
        description: "Routine updated successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update routine",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete routine')
      }

      setRoutines(prev => prev.filter(routine => routine.id !== id))
      
      toast({
        title: "Success",
        description: "Routine deleted successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete routine",
        variant: "destructive"
      })
    }
  }

  const getRoutineStats = () => {
    const total = routines.length
    const active = routines.filter(r => r.isActive).length
    const todayCount = activeTab === 'today' ? filteredRoutines.length : 
                      routines.filter(routine => {
                        const today = getDayOfWeek(new Date())
                        return routine.daysOfWeek && routine.daysOfWeek.includes(today)
                      }).length
    
    return { total, active, todayCount }
  }

  const stats = getRoutineStats()

  const tabs = ['all', 'today', 'morning', 'evening', 'active']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Routines</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your daily routines and build consistent habits
            </p>
          </div>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Routine
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Routines</h3>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Routines</h3>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Routines</h3>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="space-y-4">
        <div className="flex space-x-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {loading ? (
              // Loading skeletons
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRoutines.length === 0 ? (
              // Empty state
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No routines found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {activeTab === 'all' 
                      ? "Create your first routine to get started"
                      : `No routines match the "${activeTab}" filter`}
                  </p>
                  {activeTab === 'all' && (
                    <button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create Routine
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Routines grid
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onEdit={() => setEditingRoutine(routine)}
                    onDelete={() => handleDelete(routine.id)}
                    onToggleActive={async () => {
                      await handleUpdate(routine.id, { isActive: !routine.isActive })
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Dialog */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Create New Routine</h2>
                  <button
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Plus className="h-5 w-5 rotate-45" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <RoutineForm
                  onSubmit={handleCreate}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        {editingRoutine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Edit Routine</h2>
                  <button
                    onClick={() => setEditingRoutine(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Plus className="h-5 w-5 rotate-45" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <RoutineForm
                  routine={editingRoutine}
                  onSubmit={(data) => handleUpdate(editingRoutine.id, data)}
                  onCancel={() => setEditingRoutine(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}