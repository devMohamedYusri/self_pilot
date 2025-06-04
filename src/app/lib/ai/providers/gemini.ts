import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  BaseAIProvider, 
  ChatMessage, 
  ChatOptions, 
  ChatResponse, 
  UsageInfo,
  FunctionDefinition,
  FunctionCall 
} from './base'

export class GeminiProvider extends BaseAIProvider {
  name = 'Google Gemini'
  apiKey = process.env.GEMINI_API_KEY
  private client: GoogleGenerativeAI | null = null

  constructor() {
    super()
    if (this.apiKey) {
      this.client = new GoogleGenerativeAI(this.apiKey)
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.client
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.client) throw new Error('Gemini client not initialized')

    const model = this.client.getGenerativeModel({ model: 'gemini-pro' })
    
    // Convert messages to Gemini format
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 500,
      }
    })

    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response

    // Handle function calling (if implemented)
    const functionCalls = this.extractFunctionCalls(response.text(), options?.functions)

    return {
      content: response.text(),
      functions: functionCalls.length > 0 ? functionCalls : undefined,
      usage: {
        promptTokens: 0, // Gemini doesn't provide token counts
        completionTokens: 0,
        totalTokens: 0
      }
    }
  }

  private extractFunctionCalls(text: string, functions?: FunctionDefinition[]): FunctionCall[] {
    // Simple function extraction from text
    // In production, you'd want more sophisticated parsing
    const functionCalls: FunctionCall[] = []
    
    if (functions) {
      functions.forEach(func => {
        // Look for function calls in format: functionName(arg1, arg2)
        const regex = new RegExp(`${func.name}\\s*\$$([^)]*)\$$`, 'gi')
        const matches = text.matchAll(regex)
        
        for (const match of matches) {
          try {
            // Extract arguments string
            const argsString = match[1].trim()
            
            // Simple argument parsing - in production use proper parser
            const args: Record<string, unknown> = {}
            
            if (argsString) {
              // Try to parse as JSON first
              try {
                const parsed = JSON.parse(`{${argsString}}`)
                Object.assign(args, parsed)
              } catch {
                // Fallback to simple key=value parsing
                const argPairs = argsString.split(',').map(s => s.trim())
                argPairs.forEach(pair => {
                  const [key, value] = pair.split('=').map(s => s.trim())
                  if (key && value) {
                    // Try to parse value as JSON, fallback to string
                    try {
                      args[key] = JSON.parse(value)
                    } catch {
                      args[key] = value.replace(/^["']|["']$/g, '') // Remove quotes
                    }
                  }
                })
              }
            }
            
            functionCalls.push({
              name: func.name,
              arguments: args
            })
          } catch (error) {
            console.error(`Failed to parse function call for ${func.name}:`, error)
          }
        }
      })
    }
    
    return functionCalls
  }

  async getUsage(): Promise<UsageInfo> {
    // In a real implementation, you would track actual usage
    return {
      used: 0,
      limit: 60, // 60 requests per minute free tier
      remaining: 60
    }
  }
}