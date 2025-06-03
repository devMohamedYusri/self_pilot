import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [tasks, goals, habits, journals] = await Promise.all([
    // Tasks stats
    prisma.task.findMany({
      where: {
        userId: user.id,
        completed: false,
        aiApproved: { not: false }
      }
    }),
    // Goals stats
    prisma.goal.findMany({
      where: {
        userId: user.id,
        completed: false,
        aiApproved: { not: false }
      }
    }),
    // Habits stats
    prisma.habit.findMany({
      where: {
        userId: user.id,
        active: true,
        aiApproved: { not: false }
      }
    }),
    // Journal entries this month
    prisma.journal.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      }
    })
  ])

  // Calculate due today tasks
  const dueToday = tasks.filter(task => 
    task.dueDate && 
    task.dueDate >= today && 
    task.dueDate < tomorrow
  ).length

  // Calculate average goal progress
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0

  // Get maximum habit streak
  const maxStreak = habits.length > 0
    ? Math.max(...habits.map(h => h.streak))
    : 0

  return NextResponse.json({
    tasks: {
      active: tasks.length,
      dueToday
    },
    goals: {
      active: goals.length,
      progress: avgProgress
    },
    habits: {
      active: habits.length,
      streak: maxStreak
    },
    journal: {
      entries: journals
    }
  })
}