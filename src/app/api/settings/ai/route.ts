import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

  // Get user settings from database or return defaults
  // For now, returning defaults
  const defaultSettings = {
    aiProvider: 'auto',
    autoApprove: false,
    smartSuggestions: true,
    proactiveMode: true,
    permissions: {
      tasks: 'ask',
      goals: 'ask',
      habits: 'ask',
      routines: 'ask',
      journal: 'ask',
    },
    suggestionFrequency: 5,
    confidenceThreshold: 70,
    personalityMode: 'friendly',
    notifications: {
      suggestions: true,
      reminders: true,
      insights: true,
      achievements: true,
    }
  }

  return NextResponse.json(defaultSettings)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await req.json()

  // Save settings to database
  // For now, just return success
  return NextResponse.json({ success: true, settings })
}