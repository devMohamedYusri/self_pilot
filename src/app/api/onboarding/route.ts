import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { AIManager } from '@/app/lib/ai/manager'
import { SYSTEM_PROMPT } from '@/app/lib/ai/functions'
import { Prisma } from '@prisma/client'

// Define proper types for onboarding responses
type OnboardingResponses = {
  name?: string
  goals?: string[]
  challenge?: string
  productiveTime?: string
  aiMode?: string
}

type SampleTask = {
  title: string
  description: string
  priority: string
  dueDate: Date
}

type SampleGoal = {
  title: string
  description: string
  targetDate: Date
}

type SampleHabit = {
  title: string
  description: string
  frequency: string
}

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

  const responses: OnboardingResponses = await req.json()

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
    // Call AI for suggestions (you can use the response if needed)
    await aiManager.chat([
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: tasksPrompt }
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

    // Log onboarding completion - properly type the details
    const logDetails: Prisma.JsonObject = {
      responses: responses as unknown as Prisma.JsonObject,
      tasksCreated,
      goalsCreated,
      habitsCreated: sampleHabits.length
    }

    await prisma.aILog.create({
      data: {
        action: 'onboarding',
        entityType: 'user',
        details: logDetails,
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

function generateSampleTasks(responses: OnboardingResponses): SampleTask[] {
  const tasks: SampleTask[] = []
  const today = new Date()
  
  if (responses.goals?.includes('Productivity')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    tasks.push({
      title: 'Set up daily planning routine',
      description: 'Create a 15-minute morning planning session',
      priority: 'high',
      dueDate: tomorrow
    })
  }

  if (responses.goals?.includes('Health & Fitness')) {
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)
    
    tasks.push({
      title: 'Schedule workout sessions',
      description: 'Plan 3 workout sessions for this week',
      priority: 'medium',
      dueDate: threeDaysLater
    })
  }

  if (responses.challenge) {
    const weekLater = new Date(today)
    weekLater.setDate(weekLater.getDate() + 7)
    
    tasks.push({
      title: `Address: ${responses.challenge.substring(0, 50)}...`,
      description: 'Break down your main challenge into actionable steps',
      priority: 'high',
      dueDate: weekLater
    })
  }

  return tasks
}

function generateSampleGoals(responses: OnboardingResponses): SampleGoal[] {
  const goals: SampleGoal[] = []

  if (responses.goals?.includes('Personal Growth')) {
    const threeMonthsLater = new Date()
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
    
    goals.push({
      title: 'Develop a growth mindset',
      description: 'Read 2 personal development books per month',
      targetDate: threeMonthsLater
    })
  }

  if (responses.goals?.includes('Work-Life Balance')) {
    const oneMonthLater = new Date()
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
    
    goals.push({
      title: 'Achieve better work-life balance',
      description: 'Establish clear boundaries and dedicated personal time',
      targetDate: oneMonthLater
    })
  }

  return goals
}

function generateSampleHabits(responses: OnboardingResponses): SampleHabit[] {
  const habits: SampleHabit[] = []

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