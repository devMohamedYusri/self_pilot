import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AIManager } from '@/lib/ai/manager'
import { SYSTEM_PROMPT } from '@/lib/ai/functions'

export async function POST(req: Request) {
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

  const responses = await req.json()

  // Update user profile
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: responses.name || user.name,
    }
  })

  // Generate personalized content based on responses
  const aiManager = new AIManager()
  
  // Create initial tasks based on goals and challenges
  const tasksPrompt = `Based on the user's goals: ${responses.goals?.join(', ')}, 
    main challenge: ${responses.challenge}, 
    and productive time: ${responses.productiveTime}, 
    create 3-5 specific, actionable tasks to help them get started.
    Return as JSON array with title, description, priority, and dueDate fields.`

  try {
    const aiResponse = await aiManager.chat([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: tasksPrompt }
    ])

    // Parse AI response and create tasks
    let tasksCreated = 0
    let goalsCreated = 0

    // Create sample tasks based on user preferences
    const sampleTasks = generateSampleTasks(responses)
    for (const task of sampleTasks) {
      await prisma.task.create({
        data: {
          ...task,
          userId: user.id,
          aiSuggested: true,
          aiApproved: responses.aiMode === 'Be proactive - suggest and create tasks for me'
        }
      })
      tasksCreated++
    }

    // Create initial goals
    const sampleGoals = generateSampleGoals(responses)
    for (const goal of sampleGoals) {
      await prisma.goal.create({
        data: {
          ...goal,
          userId: user.id,
          progress: 0,
          aiSuggested: true,
          aiApproved: responses.aiMode === 'Be proactive - suggest and create tasks for me'
        }
      })
      goalsCreated++
    }

    // Create initial habits based on goals
    const sampleHabits = generateSampleHabits(responses)
    for (const habit of sampleHabits) {
      await prisma.habit.create({
        data: {
          ...habit,
          userId: user.id,
          streak: 0,
          aiSuggested: true,
          aiApproved: responses.aiMode === 'Be proactive - suggest and create tasks for me'
        }
      })
    }

    // Log onboarding completion
    await prisma.aILog.create({
      data: {
        action: 'onboarding',
        entityType: 'user',
        details: {
          responses,
          tasksCreated,
          goalsCreated,
          habitsCreated: sampleHabits.length
        },
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      tasksCreated,
      goalsCreated,
      message: 'Onboarding completed successfully'
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

function generateSampleTasks(responses: any) {
  const tasks = []
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (responses.goals?.includes('Productivity')) {
    tasks.push({
      title: 'Set up daily planning routine',
      description: 'Create a 15-minute morning planning session',
      priority: 'high',
      dueDate: tomorrow
    })
  }

  if (responses.goals?.includes('Health & Fitness')) {
    tasks.push({
      title: 'Schedule workout sessions',
      description: 'Plan 3 workout sessions for this week',
      priority: 'medium',
      dueDate: new Date(today.setDate(today.getDate() + 3))
    })
  }

  if (responses.challenge) {
    tasks.push({
      title: `Address: ${responses.challenge.substring(0, 50)}...`,
      description: 'Break down your main challenge into actionable steps',
      priority: 'high',
      dueDate: new Date(today.setDate(today.getDate() + 7))
    })
  }

  return tasks
}

function generateSampleGoals(responses: any) {
  const goals = []

  if (responses.goals?.includes('Personal Growth')) {
    goals.push({
      title: 'Develop a growth mindset',
      description: 'Read 2 personal development books per month',
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3))
    })
  }

  if (responses.goals?.includes('Work-Life Balance')) {
    goals.push({
      title: 'Achieve better work-life balance',
      description: 'Establish clear boundaries and dedicated personal time',
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    })
  }

  return goals
}

function generateSampleHabits(responses: any) {
  const habits = []

  if (responses.productiveTime?.includes('Morning')) {
    habits.push({
      title: 'Morning routine',
      description: 'Start each day with intention',
      frequency: 'daily'
    })
  }

  if (responses.goals?.includes('Health & Fitness')) {
    habits.push({
      title: 'Daily exercise',
      description: '30 minutes of physical activity',
      frequency: 'daily'
    })
  }

  if (responses.goals?.includes('Learning')) {
    habits.push({
      title: 'Learn something new',
      description: 'Dedicate 30 minutes to learning',
      frequency: 'daily'
    })
  }

  return habits
}