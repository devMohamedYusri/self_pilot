import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { AIManager } from '@/app/lib/ai/manager'
import { AI_FUNCTIONS, SYSTEM_PROMPT } from '@/app/lib/ai/functions'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'

// Define proper types
type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type FunctionCall = {
  name: string
  arguments: Record<string, unknown>
}

type FunctionExecutionResult = {
  name: string
  status: 'success' | 'error'
  result?: unknown
  error?: string
}

// Define step type for routines
type RoutineStep = {
  order: number
  task: string
  duration?: number
}

type FunctionArgs = {
  // Task related
  title?: string
  description?: string
  priority?: string
  dueDate?: string
  completed?: boolean
  taskId?: string
  
  // Goal related
  targetDate?: string
  progress?: number
  
  // Habit related
  frequency?: string
  streak?: number
  
  // Routine related
  timeOfDay?: string
  steps?: RoutineStep[]
  
  // Journal related
  content?: string
  mood?: string
  tags?: string[]
  
  // Common
  aiSuggested?: boolean
  aiApproved?: boolean
}

export async function POST(req: Request) {
  try {
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

    const { messages, message } = await req.json()

    // Build conversation history
    const conversationMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messages || []).map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // If only a single message was sent, add it
    if (message && !messages) {
      conversationMessages.push({ role: 'user', content: message })
    }

    // Initialize AI Manager
    const aiManager = new AIManager()

    // Get AI response with function calling
    const response = await aiManager.chat(conversationMessages, {
      functions: AI_FUNCTIONS,
      temperature: 0.7,
      maxTokens: 500
    })

    // Process function calls if any
    let functionsExecuted: FunctionExecutionResult[] = []
    if (response.functions && response.functions.length > 0) {
      functionsExecuted = await processFunctionCalls(response.functions, user.id)
    }

    // Log the conversation - properly type the details as JsonValue
    const logDetails: Prisma.JsonObject = {
      provider: response.provider,
      message: message || (messages && messages.length > 0 ? messages[messages.length - 1].content : ''),
      response: response.content,
      functions: functionsExecuted as Prisma.JsonArray
    }

    await prisma.aILog.create({
      data: {
        action: 'chat',
        entityType: 'conversation',
        details: logDetails,
        userId: user.id
      }
    })

    return NextResponse.json({
      content: response.content,
      functions: functionsExecuted,
      provider: response.provider
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

async function processFunctionCalls(functions: FunctionCall[], userId: string): Promise<FunctionExecutionResult[]> {
  const results: FunctionExecutionResult[] = []

  for (const func of functions) {
    try {
      const result = await executeFunction(func.name, func.arguments as FunctionArgs, userId)
      results.push({
        name: func.name,
        status: 'success',
        result
      })
    } catch (error) {
      results.push({
        name: func.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function executeFunction(name: string, args: FunctionArgs, userId: string) {
  switch (name) {
    case 'create_task':
      return await prisma.task.create({
        data: {
          title: args.title || '',
          description: args.description,
          priority: args.priority,
          userId,
          aiSuggested: true,
          aiApproved: false,
          dueDate: args.dueDate ? new Date(args.dueDate) : null
        }
      })

    case 'create_goal':
      return await prisma.goal.create({
        data: {
          title: args.title || '',
          description: args.description,
          userId,
          aiSuggested: true,
          aiApproved: false,
          progress: 0,
          targetDate: args.targetDate ? new Date(args.targetDate) : null
        }
      })

    case 'create_habit':
      return await prisma.habit.create({
        data: {
          title: args.title || '',
          description: args.description,
          frequency: args.frequency || 'daily',
          userId,
          aiSuggested: true,
          aiApproved: false,
          streak: 0
        }
      })

    case 'create_routine':
      // Properly type steps as JsonValue
      const routineSteps: Prisma.JsonValue = args.steps || []
      
      return await prisma.routine.create({
        data: {
          title: args.title || '',
          description: args.description,
          timeOfDay: args.timeOfDay || 'morning',
          userId,
          aiSuggested: true,
          aiApproved: false,
          steps: routineSteps
        }
      })

    case 'create_journal_entry':
      const entry = await prisma.journal.create({
        data: {
          title: args.title || '',
          content: args.content || '',
          mood: args.mood,
          userId,
          tags: args.tags || []
        }
      })
      
      // Generate AI analysis
      await prisma.journal.update({
        where: { id: entry.id },
        data: {
          aiAnalysis: `Mood detected: ${args.mood || 'neutral'}. This entry reflects thoughts about ${args.tags?.join(', ') || 'general topics'}.`
        }
      })
      
      return entry

    case 'list_tasks':
      return await prisma.task.findMany({
        where: {
          userId,
          ...(args.completed !== undefined && { completed: args.completed }),
          ...(args.priority && { priority: args.priority })
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })

    case 'update_task_status':
      if (!args.taskId) {
        throw new Error('taskId is required')
      }
      return await prisma.task.update({
        where: {
          id: args.taskId,
          userId
        },
        data: {
          completed: args.completed || false
        }
      })

    default:
      throw new Error(`Unknown function: ${name}`)
  }
}