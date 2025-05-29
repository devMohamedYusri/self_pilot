import { Server as SocketServer } from 'socket.io'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Socket.io endpoint' }, { status: 200 })
}
