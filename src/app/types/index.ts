// types/index.ts (add to existing file)
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: Date
  priority?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Habit {
  id: string
  name: string
  description?: string
  frequency: string
  streak: number
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Routine {
  id: string
  name: string
  description?: string
  time: string
  daysOfWeek: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[]
  isActive: boolean
  duration?: number
  reminder: boolean
  reminderTime?: number
  userId: string
  habits?: Habit[]
  tasks?: Task[]
  createdAt: Date
  updatedAt: Date
}