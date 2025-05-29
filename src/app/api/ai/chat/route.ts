import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIManager } from '@/lib/ai/manager'
import { AI_FUNCTIONS, SYSTEM_PROMPT } from '@/lib/ai/functions'
import { prisma } from '@/lib/prisma'

type FunctionExecutionResult = {
  name: string;
  status: 'success' | 'error';
  result?: any;
  error?: string;
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
    const conversationMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // If only a single message was sent, add it
    if (message && !messages) {
      conversationMessages.push({ role: 'user' as const, content: message })
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

    // Log the conversation
    await prisma.aILog.create({
      data: {
        action: 'chat',
        entityType: 'conversation',
        details: {
          provider: response.provider,
          message: message || messages[messages.length - 1]?.content,
          response: response.content,
          functions: functionsExecuted
        },
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

async function processFunctionCalls(functions: any[], userId: string): Promise<FunctionExecutionResult[]> {
  const results: FunctionExecutionResult[] = []

  for (const func of functions) {
    try {
      const result = await executeFunction(func.name, func.arguments, userId)
      results.push({
        name: func.name,
        status: 'success' as const,
        result
      })
    } catch (error) {
      results.push({
        name: func.name,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return results
}

async function executeFunction(name: string, args: any, userId: string) {
  switch (name) {
    case 'create_task':
      return await prisma.task.create({
        data: {
          ...args,
          userId,
          aiSuggested: true,
          aiApproved: false,
          dueDate: args.dueDate ? new Date(args.dueDate) : null
        }
      })

    case 'create_goal':
      return await prisma.goal.create({
        data: {
          ...args,
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
          ...args,
          userId,
          aiSuggested: true,
          aiApproved: false,
          streak: 0
        }
      })

    case 'create_routine':
      return await prisma.routine.create({
        data: {
          ...args,
          userId,
          aiSuggested: true,
          aiApproved: false,
          steps: args.steps || []
        }
      })

    case 'create_journal_entry':
      const entry = await prisma.journal.create({
        data: {
          ...args,
          userId,
          tags: args.tags || []
        }
      })
      
      // Generate AI analysis
      // This would normally call the AI again for analysis
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
      return await prisma.task.update({
        where: {
          id: args.taskId,
          userId
        },
        data: {
          completed: args.completed
        }
      })

    default:
      throw new Error(`Unknown function: ${name}`)
  }
}