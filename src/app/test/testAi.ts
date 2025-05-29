import { AIManager } from '@/lib/ai/manager'
import { AI_FUNCTIONS, SYSTEM_PROMPT } from '@/lib/ai/functions'

async function testAI() {
  console.log('🤖 Testing AI Manager...\n')
  
  const manager = new AIManager()
  const providers = manager.getAvailableProviders()
  
  console.log('Available providers:', providers)
  
  if (providers.length === 0) {
    console.error('❌ No AI providers available. Please set API keys in .env.local')
    return
  }
  
  const testMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: 'I need to prepare for a job interview next week' }
  ]
  
  try {
    console.log('\n📤 Sending test message...')
    const response = await manager.chat(testMessages, {
      functions: AI_FUNCTIONS,
      temperature: 0.7,
      maxTokens: 500
    })
    
    console.log('\n✅ Response from', response.provider)
    console.log('Content:', response.content)
    
    if (response.functions && response.functions.length > 0) {
      console.log('\n🔧 Function calls:')
      response.functions.forEach(func => {
        console.log(`- ${func.name}:`, func.arguments)
      })
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testAI()