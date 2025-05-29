// app/api/routines/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { routineSchema } from '@/app/lib/validations/routine'
import { ZodError } from 'zod'

// GET /api/routines
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const routines = await prisma.routine.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        habits: true,
        tasks: true
      },
      orderBy: {
        timeOfDay: 'asc'
      }
    })

    return NextResponse.json(routines)
  } catch (error) {
    console.error('Error fetching routines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routines' },
      { status: 500 }
    )
  }
}

// POST /api/routines
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    // Validate request body
    const validatedData = routineSchema.parse(body)

    const routine = await prisma.routine.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        habits: {
          connect: validatedData.habitIds?.map(id => ({ id })) || []
        },
        tasks: {
          connect: validatedData.taskIds?.map(id => ({ id })) || []
        }
      },
      include: {
        habits: true,
        tasks: true
      }
    })

    // Emit real-time update
    if (global.io) {
      global.io.to(`user:${session.user.id}`).emit('routine:created', routine)
    }

    return NextResponse.json(routine)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating routine:', error)
    return NextResponse.json(
      { error: 'Failed to create routine' },
      { status: 500 }
    )
  }
}