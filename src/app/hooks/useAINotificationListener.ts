import { useEffect } from 'react'
import { useAINotifications } from '@/app/components/notifications/AINotificationSystem'
import { aiNotificationManager } from '@/lib/notifications/AINotificationManager'
import { useRouter } from 'next/navigation'

export function useAINotificationListener() {
  const { showAISuggestion, showAIAction, showAIInsight } = useAINotifications()
  const router = useRouter()

  useEffect(() => {
    const handleNotification = (event: any) => {
      switch (event.type) {
        case 'task_suggestion':
          showAISuggestion({
            id: event.data.id,
            type: 'suggestion',
            title: 'New Task Suggestion',
            message: event.data.message,
            actionType: 'task',
            actionData: event.data.task,
            onApprove: async () => {
              await fetch('/api/ai/suggestions/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event.data)
              })
              showAIAction('Task created successfully!', 'success')
              router.refresh()
            },
            onReject: async () => {
              await fetch('/api/ai/suggestions/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event.data)
              })
            }
          })
          break

        case 'habit_reminder':
          showAISuggestion({
            id: event.data.id,
            type: 'reminder',
            title: 'Habit Reminder',
            message: event.data.message,
            onApprove: () => {
              router.push('/dashboard/habits')
            }
          })
          break

        case 'insight':
          showAIInsight(event.data.message)
          break

        case 'completion':
          showAIAction(event.data.message, 'success')
          break
      }
    }

    aiNotificationManager.on('notification', handleNotification)

    return () => {
      aiNotificationManager.off('notification', handleNotification)
    }
  }, [showAISuggestion, showAIAction, showAIInsight, router])
}