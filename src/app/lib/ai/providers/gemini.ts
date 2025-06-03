import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseAIProvider, ChatMessage, ChatOptions, ChatResponse } from './base'

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
      functions: functionCalls,
      usage: {
        promptTokens: 0, // Gemini doesn't provide token counts
        completionTokens: 0,
        totalTokens: 0
      }
    }
  }

  private extractFunctionCalls(text: string, functions?: any[]): any[] {
    // Simple function extraction from text
    // In production, you'd want more sophisticated parsing
    const functionCalls: any[] = []
    
    if (functions) {
      functions.forEach(func => {
        const regex = new RegExp(`${func.name}\\s*\$$([^)]*)\$$`, 'gi')
        const matches = text.match(regex)
        if (matches) {
          functionCalls.push({
            name: func.name,
            arguments: {} // Would need proper parsing
          })
        }
      })
    }
    
    return functionCalls
  }

  async getUsage(): Promise<UsageInfo> {
    return {
      used: 0,
      limit: 60, // 60 requests per minute free tier
      remaining: 60
    }
  }
}