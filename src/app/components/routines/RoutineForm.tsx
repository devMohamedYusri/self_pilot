// components/RoutineForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Calendar, Bell, Target, ListTodo } from 'lucide-react'
import { routineSchema, type RoutineFormData } from '@/app/lib/validations/routine'
import { Routine, Habit, Task } from '@/app/types'
import { useToast } from '@/app/hooks/use-toast'

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

interface RoutineFormProps {
  routine?: Routine
  onSubmit: (data: RoutineFormData) => Promise<void>
  onCancel: () => void
}

const daysOfWeek: { value: DayOfWeek; label: string }[] = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
]

export function RoutineForm({ routine, onSubmit, onCancel }: RoutineFormProps) {
  const [loading, setLoading] = useState(false)
  const [habits, setHabits] = useState<Habit[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<RoutineFormData>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      name: routine?.name || '',
      description: routine?.description || '',
      time: routine?.time || '09:00',
      daysOfWeek: routine?.daysOfWeek || [],
      isActive: routine?.isActive ?? true,
      duration: routine?.duration || 30,
      reminder: routine?.reminder || false,
      reminderTime: routine?.reminderTime || 15,
      habitIds: routine?.habits?.map((h: Habit) => h.id) || [],
      taskIds: routine?.tasks?.map((t: Task) => t.id) || [],
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    fetchHabitsAndTasks()
  }, [])

  const fetchHabitsAndTasks = async () => {
    try {
      const [habitsRes, tasksRes] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/tasks')
      ])

      if (habitsRes.ok) {
        const habitsData = await habitsRes.json()
        setHabits(habitsData)
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData)
      }
    } catch (error) {
      console.error('Error fetching habits and tasks:', error)
    }
  }

  const onSubmitForm: SubmitHandler<RoutineFormData> = async (data) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save routine. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Routine Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Morning Routine"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Describe what this routine is about..."
            />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Schedule</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="time"
                {...register('time')}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              min="1"
              max="480"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Days of Week</label>
          <div className="grid grid-cols-2 gap-3">
            {daysOfWeek.map((day) => (
              <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={day.value}
                  checked={watchedValues.daysOfWeek?.includes(day.value)}
                  onChange={(e) => {
                    const current = watchedValues.daysOfWeek || []
                    if (e.target.checked) {
                      setValue('daysOfWeek', [...current, day.value])
                    } else {
                      setValue('daysOfWeek', current.filter((d: string) => d !== day.value))
                    }
                  }}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{day.label}</span>
              </label>
            ))}
          </div>
          {errors.daysOfWeek && (
            <p className="text-red-500 text-sm mt-1">{errors.daysOfWeek.message}</p>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer">
            <div>
              <div className="font-medium">Enable Reminder</div>
              <div className="text-sm text-gray-500">Get notified before your routine starts</div>
            </div>
            <input
              type="checkbox"
              {...register('reminder')}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          {watchedValues.reminder && (
            <div>
              <label className="block text-sm font-medium mb-2">Reminder Time</label>
              <select
                {...register('reminderTime', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 minutes before</option>
                <option value={10}>10 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Linked Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Linked Items</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Habits</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {habits.length === 0 ? (
                <p className="text-sm text-gray-500">No habits available</p>
              ) : (
                habits.map((habit) => (
                  <label key={habit.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={habit.id}
                      checked={watchedValues.habitIds?.includes(habit.id)}
                      onChange={(e) => {
                        const current = watchedValues.habitIds || []
                        if (e.target.checked) {
                          setValue('habitIds', [...current, habit.id])
                        } else {
                          setValue('habitIds', current.filter((id: string) => id !== habit.id))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3" />
                      <span className="text-sm">{habit.name}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">Select habits to track as part of this routine</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tasks</label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks available</p>
              ) : (
                tasks.filter(task => !task.completed).map((task) => (
                    <label key={task.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={task.id}
                        checked={watchedValues.taskIds?.includes(task.id)}
                        onChange={(e) => {
                          const current = watchedValues.taskIds || []
                          if (e.target.checked) {
                            setValue('taskIds', [...current, task.id])
                          } else {
                            setValue('taskIds', current.filter((id: string) => id !== task.id))
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-3 w-3" />
                        <span className="text-sm">{task.title}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Select tasks to complete as part of this routine</p>
            </div>
          </div>
        </div>
  
        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Status</h3>
          
          <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer">
            <div>
              <div className="font-medium">Active</div>
              <div className="text-sm text-gray-500">Enable or disable this routine</div>
            </div>
            <input
              type="checkbox"
              {...register('isActive')}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
  
        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : routine ? 'Update Routine' : 'Create Routine'}
          </button>
        </div>
      </form>
    )
  }