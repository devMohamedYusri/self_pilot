// components/RoutineCard.tsx
'use client'

import { useState } from 'react'
import { 
  Clock, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Power,
  Bell,
  CheckCircle,
  ListTodo,
  Target
} from 'lucide-react'
import { cn } from '@/app/lib/utils'
import { Routine } from '@/app/types'

interface RoutineCardProps {
  routine: Routine
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}

const dayAbbreviations: Record<string, string> = {
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thu: 'T',
  fri: 'F',
  sat: 'S',
  sun: 'S'
}

const dayOrder: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const getDayOfWeek = (date: Date): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[date.getDay()] as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
}

export function RoutineCard({ routine, onEdit, onDelete, onToggleActive }: RoutineCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleToggleActive = async () => {
    setIsToggling(true)
    await onToggleActive()
    setIsToggling(false)
  }

  const getTimeDisplay = () => {
    if (!routine.time) return 'No time set'
    const [hours, minutes] = routine.time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getDurationDisplay = () => {
    if (!routine.duration) return null
    const hours = Math.floor(routine.duration / 60)
    const minutes = routine.duration % 60
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }
    return `${minutes}m`
  }

  const isActiveToday = () => {
    const today = getDayOfWeek(new Date())
    return routine.daysOfWeek.includes(today)
  }

  return (
    <>
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border p-6 transition-all duration-200",
        !routine.isActive && "opacity-60",
        isActiveToday() && routine.isActive && "ring-2 ring-blue-500/20"
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{routine.name}</h3>
            {routine.description && (
              <p className="text-sm text-gray-500">{routine.description}</p>
            )}
          </div>
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </button>
            
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border z-20">
                  <button
                    onClick={() => {
                      onEdit()
                      setShowDropdown(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteDialog(true)
                      setShowDropdown(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Time and Duration */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{getTimeDisplay()}</span>
              {routine.duration && (
                <>
                  <span>•</span>
                  <span>{getDurationDisplay()}</span>
                </>
              )}
            </div>
            {routine.reminder && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">
                <Bell className="h-3 w-3" />
                {routine.reminderTime}m before
              </div>
            )}
          </div>

          {/* Days of Week */}
          <div className="flex gap-1">
            {dayOrder.map((day) => (
              <div
                key={day}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  routine.daysOfWeek.includes(day)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                )}
              >
                {dayAbbreviations[day]}
              </div>
            ))}
          </div>

          {/* Linked Items */}
          {(routine.habits?.length || routine.tasks?.length) ? (
            <div className="space-y-2">
              {routine.habits && routine.habits.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Target className="h-4 w-4" />
                  <span>{routine.habits.length} habit{routine.habits.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {routine.tasks && routine.tasks.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ListTodo className="h-4 w-4" />
                  <span>{routine.tasks.length} task{routine.tasks.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Power className={cn(
                "h-4 w-4",
                routine.isActive ? "text-green-600" : "text-gray-400"
              )} />
              <span className="text-sm font-medium">
                {routine.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={routine.isActive}
                onChange={handleToggleActive}
                disabled={isToggling}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Routine</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{routine.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowDeleteDialog(false)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}