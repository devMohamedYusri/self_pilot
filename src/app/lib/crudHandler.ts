import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/app/lib/prisma'
import type { Prisma } from '@prisma/client'
import type { Task, Goal, Habit, Journal } from '@/app/types'

// Define the models that support CRUD operations
type CrudModel = 'task' | 'goal' | 'habit' | 'journal'

// Define the entity types
type EntityMap = {
  task: Task
  goal: Goal
  habit: Habit
  journal: Journal
}

// Define create input types
type CreateInputMap = {
  task: Prisma.TaskCreateInput
  goal: Prisma.GoalCreateInput
  habit: Prisma.HabitCreateInput
  journal: Prisma.JournalCreateInput
}

// Define update input types
type UpdateInputMap = {
  task: Prisma.TaskUpdateInput
  goal: Prisma.GoalUpdateInput
  habit: Prisma.HabitUpdateInput
  journal: Prisma.JournalUpdateInput
}

// Base entity interface that all CRUD entities should have
interface BaseEntity {
  id: string
  userId: string
  createdAt: Date
}

// Define Prisma model methods interface
interface PrismaModelMethods<T, CreateInput, UpdateInput> {
  findMany: (args?: {
    where?: Record<string, unknown>
    include?: Record<string, boolean>
    orderBy?: Record<string, 'asc' | 'desc'>
  }) => Promise<T[]>
  
  create: (args: {
    data: CreateInput
  }) => Promise<T>
  
  update: (args: {
    where: { id: string; userId?: string }
    data: UpdateInput
  }) => Promise<T>
  
  delete: (args: {
    where: { id: string; userId?: string }
  }) => Promise<T>
}

// Type for getting the correct Prisma model
type GetPrismaModel<T extends CrudModel> = 
  T extends 'task' ? PrismaModelMethods<Task, Prisma.TaskCreateInput, Prisma.TaskUpdateInput> :
  T extends 'goal' ? PrismaModelMethods<Goal, Prisma.GoalCreateInput, Prisma.GoalUpdateInput> :
  T extends 'habit' ? PrismaModelMethods<Habit, Prisma.HabitCreateInput, Prisma.HabitUpdateInput> :
  T extends 'journal' ? PrismaModelMethods<Journal, Prisma.JournalCreateInput, Prisma.JournalUpdateInput> :
  never

interface CrudHandlerOptions<T extends CrudModel> {
  model: T
  includeRelations?: string[]
}

export function createCrudHandlers<T extends CrudModel>({ 
  model, 
  includeRelations = [] 
}: CrudHandlerOptions<T>) {
  const modelClient = prisma[model] as unknown as GetPrismaModel<T>

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

    const includeObj = includeRelations.reduce<Record<string, boolean>>(
      (acc, rel) => ({ ...acc, [rel]: true }), 
      {}
    )

    const items = await modelClient.findMany({
      where: { userId: user.id },
      include: includeObj,
      orderBy: { createdAt: 'desc' }
    }) as EntityMap[T][]

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

    const body = await req.json() as Partial<CreateInputMap[T]> & { aiSuggested?: boolean }
    
    const item = await modelClient.create({
      data: {
        ...body,
        userId: user.id,
      } as Prisma.Args<typeof modelClient, 'create'>['data']
    }) as EntityMap[T]

    if (body.aiSuggested) {
      await prisma.aILog.create({
        data: {
          action: 'create',
          entityType: model,
          entityId: (item as BaseEntity).id,
          details: body as Prisma.InputJsonValue,
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

    const body = await req.json() as Partial<UpdateInputMap[T]>
    
    const item = await modelClient.update({
      where: { 
        id,
        userId: user.id 
      },
      data: body as UpdateInputMap[T],
    }) as EntityMap[T]

    await prisma.aILog.create({
      data: {
        action: 'update',
        entityType: model,
        entityId: (item as BaseEntity).id,
        details: body as Prisma.InputJsonValue,
        userId: user.id,
      }
    })

    return NextResponse.json(item)
  }

  const remove = async (_req: Request, id: string) => {
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
        entityType: model,
        entityId: id,
        details: { [`${model}Id`]: id } as Prisma.InputJsonValue,
        userId: user.id,
      }
    })

    return NextResponse.json({ success: true })
  }

  return { getAll, create, update, remove }
}

// Type-safe usage example:
// const taskHandlers = createCrudHandlers({ model: 'task', includeRelations: ['user'] })
// const goalHandlers = createCrudHandlers({ model: 'goal' })