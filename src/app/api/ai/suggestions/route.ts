import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  // Fetch all AI suggested items
  const [tasks, goals, habits, routines] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: user.id,
        aiSuggested: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.goal.findMany({
      where: {
        userId: user.id,
        aiSuggested: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.habit.findMany({
      where: {
        userId: user.id,
        aiSuggested: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.routine.findMany({
      where: {
        userId: user.id,
        aiSuggested: true
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  // Format suggestions
  const suggestions = [
    ...tasks.map(task => ({
      id: task.id,
      type: 'task',
      data: task,
      status: task.aiApproved === null ? 'pending' : (task.aiApproved ? 'approved' : 'rejected')
    })),
    ...goals.map(goal => ({
      id: goal.id,
      type: 'goal',
      data: goal,
      status: goal.aiApproved === null ? 'pending' : (goal.aiApproved ? 'approved' : 'rejected')
    })),
    ...habits.map(habit => ({
      id: habit.id,
      type: 'habit',
      data: habit,
      status: habit.aiApproved === null ? 'pending' : (habit.aiApproved ? 'approved' : 'rejected')
    })),
    ...routines.map(routine => ({
      id: routine.id,
      type: 'routine',
      data: routine,
      status: routine.aiApproved === null ? 'pending' : (routine.aiApproved ? 'approved' : 'rejected')
    }))
  ]

  // Sort by creation date
  suggestions.sort((a, b) => 
    new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
  )

  return NextResponse.json(suggestions)
}