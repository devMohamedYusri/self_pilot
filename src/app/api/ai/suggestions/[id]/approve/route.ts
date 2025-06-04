import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  // Check each model individually for better type safety
  
  // Check tasks
  const task = await prisma.task.findFirst({
    where: {
      id: params.id,
      userId: user.id,
      aiSuggested: true
    }
  })

  if (task) {
    await prisma.task.update({
      where: { id: params.id },
      data: { aiApproved: true }
    })

    const logDetails: Prisma.JsonObject = { approved: true }
    await prisma.aILog.create({
      data: {
        action: 'approve',
        entityType: 'task',
        entityId: params.id,
        details: logDetails,
        approved: true,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true, type: 'task' })
  }

  // Check goals
  const goal = await prisma.goal.findFirst({
    where: {
      id: params.id,
      userId: user.id,
      aiSuggested: true
    }
  })

  if (goal) {
    await prisma.goal.update({
      where: { id: params.id },
      data: { aiApproved: true }
    })

    const logDetails: Prisma.JsonObject = { approved: true }
    await prisma.aILog.create({
      data: {
        action: 'approve',
        entityType: 'goal',
        entityId: params.id,
        details: logDetails,
        approved: true,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true, type: 'goal' })
  }

  // Check habits
  const habit = await prisma.habit.findFirst({
    where: {
      id: params.id,
      userId: user.id,
      aiSuggested: true
    }
  })

  if (habit) {
    await prisma.habit.update({
      where: { id: params.id },
      data: { aiApproved: true }
    })

    const logDetails: Prisma.JsonObject = { approved: true }
    await prisma.aILog.create({
      data: {
        action: 'approve',
        entityType: 'habit',
        entityId: params.id,
        details: logDetails,
        approved: true,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true, type: 'habit' })
  }

  return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
}