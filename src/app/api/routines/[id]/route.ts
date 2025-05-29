// app/api/routines/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { routineSchema } from '@/lib/validations/routine'
import { ZodError } from 'zod'

// GET /api/routines/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const routine = await prisma.routine.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        habits: true,
        tasks: true
      }
    })

    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    return NextResponse.json(routine)
  } catch (error) {
    console.error('Error fetching routine:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routine' },
      { status: 500 }
    )
  }
}

// PATCH /api/routines/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    // Validate request body (partial update)
    const validatedData = routineSchema.partial().parse(body)

    // Check if routine exists and belongs to user
    const existingRoutine = await prisma.routine.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingRoutine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    // Update routine
    const routine = await prisma.routine.update({
      where: {
        id: params.id
      },
      data: {
        ...validatedData,
        habits: validatedData.habitIds ? {
          set: validatedData.habitIds.map(id => ({ id }))
        } : undefined,
        tasks: validatedData.taskIds ? {
          set: validatedData.taskIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        habits: true,
        tasks: true
      }
    })

    // Emit real-time update
    if (global.io) {
      global.io.to(`user:${session.user.id}`).emit('routine:updated', routine)
    }

    return NextResponse.json(routine)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating routine:', error)
    return NextResponse.json(
      { error: 'Failed to update routine' },
      { status: 500 }
    )
  }
}

// DELETE /api/routines/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if routine exists and belongs to user
    const routine = await prisma.routine.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!routine) {
      return NextResponse.json({ error: 'Routine not found' }, { status: 404 })
    }

    // Delete routine
    await prisma.routine.delete({
      where: {
        id: params.id
      }
    })

    // Emit real-time update
    if (global.io) {
      global.io.to(`user:${session.user.id}`).emit('routine:deleted', { id: params.id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting routine:', error)
    return NextResponse.json(
      { error: 'Failed to delete routine' },
      { status: 500 }
    )
  }
}