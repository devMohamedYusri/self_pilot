import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      )
    }
    
    // Check if user exists
    const exists = await prisma.user.findUnique({
      where: { email }
    })
    
    if (exists) {
      return NextResponse.json(
        { error: 'User already exists' }, 
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })
    
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'User created successfully' 
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Server error' }, 
      { status: 500 }
    )
  }
}