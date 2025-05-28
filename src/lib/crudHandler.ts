import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CrudHandlerOptions {
  model: keyof typeof prisma
  includeRelations?: string[]
}

export function createCrudHandlers({ model, includeRelations = [] }: CrudHandlerOptions) {
  const modelClient = prisma[model] as any

  const getAll = async () => {
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

    const items = await modelClient.findMany({
      where: { userId: user.id },
      include: includeRelations.reduce((acc, rel) => ({ ...acc, [rel]: true }), {}),
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(items)
  }

  const create = async (req: Request) => {
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
    const item = await modelClient.create({
      data: {
        ...body,
        userId: user.id,
      }
    })

    if (body.aiSuggested) {
      await prisma.aILog.create({
        data: {
          action: 'create',
          entityType: model.toString().toLowerCase(),
          entityId: item.id,
          details: body,
          userId: user.id,
        }
      })
    }

    return NextResponse.json(item)
  }

  const update = async (req: Request, id: string) => {
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
    const item = await modelClient.update({
      where: { 
        id,
        userId: user.id 
      },
      data: body,
    })

    await prisma.aILog.create({
      data: {
        action: 'update',
        entityType: model.toString().toLowerCase(),
        entityId: item.id,
        details: body,
        userId: user.id,
      }
    })

    return NextResponse.json(item)
  }

  const remove = async (req: Request, id: string) => {
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

    await modelClient.delete({
      where: { 
        id,
        userId: user.id 
      }
    })

    await prisma.aILog.create({
      data: {
        action: 'delete',
        entityType: model.toString().toLowerCase(),
        entityId: id,
        details: { [`${model.toString().toLowerCase()}Id`]: id },
        userId: user.id,
      }
    })

    return NextResponse.json({ success: true })
  }

  return { getAll, create, update, remove }
}