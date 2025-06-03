// src/app/api/journals/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'

export async function GET(
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

  try {
    const journal = await prisma.journal.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    })

    if (!journal) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    return NextResponse.json(journal)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 })
  }
}

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
  const journal = await prisma.journal.update({
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
      entityType: 'journal',
      entityId: journal.id,
      details: body,
      userId: user.id,
    }
  })

  return NextResponse.json(journal)
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

  await prisma.journal.delete({
    where: { 
      id: params.id,
      userId: user.id 
    }
  })

  // Log AI action
  await prisma.aILog.create({
    data: {
      action: 'delete',
      entityType: 'journal',
      entityId: params.id,
      details: { journalId: params.id },
      userId: user.id,
    }
  })

  return NextResponse.json({ success: true })
}