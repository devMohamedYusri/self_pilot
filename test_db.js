const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('\n📋 Users in database:')
    console.table(users)
    
    // Test password for first user if exists
    if (users.length > 0) {
      const userWithPassword = await prisma.user.findUnique({
        where: { email: users[0].email }
      })
      
      if (userWithPassword?.password) {
        // Test password comparison
        const testPassword = 'your-test-password' // Replace with actual password
        const isValid = await bcrypt.compare(testPassword, userWithPassword.password)
        console.log(`\n🔐 Password test for ${users[0].email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()