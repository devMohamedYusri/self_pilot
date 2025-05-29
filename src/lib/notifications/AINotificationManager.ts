import { EventEmitter } from 'events'

export interface AINotificationEvent {
  type: 'task_suggestion' | 'goal_suggestion' | 'habit_reminder' | 'insight' | 'completion'
  data: any
  metadata?: {
    priority?: 'low' | 'medium' | 'high'
    requiresAction?: boolean
    expiresAt?: Date
  }
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

  notify(event: AINotificationEvent) {
    // Add to queue based on priority
    if (event.metadata?.priority === 'high') {
      this.queue.unshift(event)
    } else {
      this.queue.push(event)
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

  private checkScheduledNotifications() {
    // This would check for things like:
    // - Habit reminders
    // - Task due dates
    // - Goal check-ins
    // - Inactivity reminders
  }
}

export const aiNotificationManager = AINotificationManager.getInstance()