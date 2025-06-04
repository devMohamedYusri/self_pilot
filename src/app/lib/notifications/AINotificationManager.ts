import { EventEmitter } from 'events'

// Extended metadata interface
export interface NotificationMetadata {
  priority?: 'low' | 'medium' | 'high'
  requiresAction?: boolean
  expiresAt?: Date
}

// Create a new event type that combines the discriminated union with metadata
export type AINotificationEventType = 'task_suggestion' | 'goal_suggestion' | 'habit_reminder' | 'insight' | 'completion'

// Map the notification data based on type
export interface NotificationDataMap {
  task_suggestion: {
    id: string
    message: string
    task: {
      title: string
      description?: string
      dueDate?: Date | string
      priority?: 'low' | 'medium' | 'high'
    }
  }
  goal_suggestion: {
    id: string
    message: string
    goal: {
      title: string
      description?: string
      targetDate?: Date | string
    }
  }
  habit_reminder: {
    id: string
    message: string
    habitId: string
    habitName: string
    streak?: number
  }
  insight: {
    id: string
    message: string
    category?: string
    metrics?: Record<string, number>
  }
  completion: {
    id: string
    message: string
    entityType: 'task' | 'goal' | 'habit'
    entityId: string
    completedCount?: number
  }
}

// Discriminated union for the event
export type AINotificationEvent<T extends AINotificationEventType = AINotificationEventType> = T extends AINotificationEventType ? {
  type: T
  data: NotificationDataMap[T]
  metadata?: NotificationMetadata
} : never

// Type guard function
function isValidNotificationType(type: string): type is AINotificationEventType {
  return ['task_suggestion', 'goal_suggestion', 'habit_reminder', 'insight', 'completion'].includes(type)
}

class AINotificationManager extends EventEmitter {
  private static instance: AINotificationManager
  private queue: AINotificationEvent[] = []
  private processing = false

  private constructor() {
    super()
    this.startProcessing()
  }

  static getInstance(): AINotificationManager {
    if (!AINotificationManager.instance) {
      AINotificationManager.instance = new AINotificationManager()
    }
    return AINotificationManager.instance
  }

  notify<T extends AINotificationEventType>(event: AINotificationEvent<T>) {
    // Validate event type
    if (!isValidNotificationType(event.type)) {
      console.error(`Invalid notification type: ${event.type}`)
      return
    }

    // Add to queue based on priority
    if (event.metadata?.priority === 'high') {
      this.queue.unshift(event as AINotificationEvent)
    } else {
      this.queue.push(event as AINotificationEvent)
    }
    this.processQueue()
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    
    while (this.queue.length > 0) {
      const notification = this.queue.shift()
      if (notification) {
        this.emit('notification', notification)
        
        // Wait between notifications to avoid overwhelming the user
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    this.processing = false
  }

  private startProcessing() {
    // Check for scheduled notifications every minute
    setInterval(() => {
      this.checkScheduledNotifications()
    }, 60000)
  }

  private async checkScheduledNotifications() {
    // This would check for things like:
    // - Habit reminders
    const habits = await this.checkHabitReminders()
    habits.forEach(habit => {
      this.notify({
        type: 'habit_reminder',
        data: {
          id: `habit-reminder-${habit.id}`,
          message: `Time for your habit: ${habit.name}`,
          habitId: habit.id,
          habitName: habit.name,
          streak: habit.streak
        },
        metadata: {
          priority: 'medium',
          requiresAction: true
        }
      })
    })

    // - Task due dates
    const dueTasks = await this.checkTaskDueDates()
    dueTasks.forEach(task => {
      this.notify({
        type: 'task_suggestion',
        data: {
          id: `task-due-${task.id}`,
          message: `Task "${task.title}" is due soon`,
          task: {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority as 'low' | 'medium' | 'high'
          }
        },
        metadata: {
          priority: 'high',
          requiresAction: true
        }
      })
    })

    // - Goal check-ins
    const goals = await this.checkGoalProgress()
    goals.forEach(goal => {
      this.notify({
        type: 'goal_suggestion',
        data: {
          id: `goal-checkin-${goal.id}`,
          message: `Check in on your goal: ${goal.title}`,
          goal: {
            title: goal.title,
            description: goal.description,
            targetDate: goal.targetDate
          }
        },
        metadata: {
          priority: 'low',
          requiresAction: false
        }
      })
    })

    // - Inactivity reminders
    const inactivityInsight = await this.checkInactivity()
    if (inactivityInsight) {
      this.notify({
        type: 'insight',
        data: {
          id: 'inactivity-insight',
          message: inactivityInsight.message,
          category: 'activity',
          metrics: inactivityInsight.metrics
        },
        metadata: {
          priority: 'low'
        }
      })
    }
  }

  // Placeholder methods - implement with actual data fetching
  private async checkHabitReminders(): Promise<Array<{id: string, name: string, streak: number}>> {
    // TODO: Implement actual habit checking logic
    return []
  }

  private async checkTaskDueDates(): Promise<Array<{id: string, title: string, description?: string, dueDate: string, priority: string}>> {
    // TODO: Implement actual task due date checking
    return []
  }

  private async checkGoalProgress(): Promise<Array<{id: string, title: string, description?: string, targetDate: string}>> {
    // TODO: Implement actual goal progress checking
    return []
  }

  private async checkInactivity(): Promise<{message: string, metrics: Record<string, number>} | null> {
    // TODO: Implement inactivity checking
    return null
  }
}

export const aiNotificationManager = AINotificationManager.getInstance()