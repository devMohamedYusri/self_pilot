import { NextResponse } from 'next/server'
import { AIManager } from '@/app/lib/ai/manager'

export async function GET() {
  const manager = new AIManager()
  const providers = manager.getAvailableProviders()
  
  return NextResponse.json({ providers })
}