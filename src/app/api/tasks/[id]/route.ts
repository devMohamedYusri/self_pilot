import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: Request,
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

  const body = await req.json()
  const task = await prisma.task.update({
    where: { 
      id: params.id,
      userId: user.id 
    },
    data: body,
  })

  // Log AI action
  await prisma.aILog.create({
    data: {
      action: 'update',
      entityType: 'task',
      entityId: task.id,
      details: body,
      userId: user.id,
    }
  })

  return NextResponse.json(task)
}

export async function DELETE(
  req: Request,
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

  await prisma.task.delete({
    where: { 
      id: params.id,
      userId: user.id 
    }
  })

  // Log AI action
  await prisma.aILog.create({
    data: {
      action: 'delete',
      entityType: 'task',
      entityId: params.id,
      details: { taskId: params.id },
      userId: user.id,
    }
  })

  return NextResponse.json({ success: true })
}