import OpenAI from 'openai'
import { BaseAIProvider, ChatMessage, ChatOptions, ChatResponse } from './base'

export class OpenAIProvider extends BaseAIProvider {
  name = 'OpenAI'
  apiKey = process.env.OPENAI_API_KEY
  private client: OpenAI | null = null

  constructor() {
    super()
    if (this.apiKey) {
      this.client = new OpenAI({ apiKey: this.apiKey })
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.client
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.client) throw new Error('OpenAI client not initialized')

    const functions = options?.functions?.map(f => ({
      type: 'function' as const,
      function: {
        name: f.name,
        description: f.description,
        parameters: f.parameters
      }
    }))

    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 500,
      tools: functions,
      tool_choice: functions ? 'auto' : undefined
    })

    const message = response.choices[0].message
    const functionCalls = message.tool_calls?.map(call => ({
      name: call.function.name,
      arguments: JSON.parse(call.function.arguments)
    }))

    return {
      content: message.content || '',
      functions: functionCalls,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    }
  }

  async getUsage(): Promise<UsageInfo> {
    // OpenAI doesn't provide direct usage API, return mock data
    return {
      used: 0,
      limit: 5000,
      remaining: 5000
    }
  }
}