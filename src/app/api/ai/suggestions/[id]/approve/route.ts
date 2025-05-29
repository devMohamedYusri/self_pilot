import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

  // Try to find the suggestion in each model
  const models = ['task', 'goal', 'habit', 'routine'] as const
  
  for (const model of models) {
    const record = await (prisma[model] as any).findFirst({
      where: {
        id: params.id,
        userId: user.id,
        aiSuggested: true
      }
    })

    if (record) {
      // Update the record
      await (prisma[model] as any).update({
        where: { id: params.id },
        data: { aiApproved: true }
      })

      // Log the approval
      await prisma.aILog.create({
        data: {
          action: 'approve',
          entityType: model,
          entityId: params.id,
          details: { approved: true },
          approved: true,
          userId: user.id
        }
      })

      return NextResponse.json({ success: true, type: model })
    }
  }

  return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })
}