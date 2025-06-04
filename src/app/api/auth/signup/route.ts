// api/auth/signup/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/app/lib/prisma'

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
    
    // Fixed: Remove unused variable by creating a new object without password
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      image:user.image,
      verfied:user.emailVerified
    }
    
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