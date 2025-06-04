
export interface AIProvider {
  name: string
  apiKey: string | undefined
  isAvailable(): boolean
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>
  getUsage(): Promise<UsageInfo>
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  functions?: FunctionDefinition[]
}

export interface ChatResponse {
  content: string
  functions?: FunctionCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface FunctionDefinition {
  name: string
  description: string
  parameters: FunctionParameters
}

export interface FunctionCall {
  name: string
  arguments: Record<string, unknown> | string
}

export interface UsageInfo {
  used: number
  limit: number
  remaining: number
}

// JSON Schema types for function parameters
export interface FunctionParameters {
  type: 'object'
  properties: Record<string, PropertySchema>
  required?: string[]
}

export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: unknown[]
  items?: PropertySchema
  properties?: Record<string, PropertySchema>
  default?: unknown
}

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string
  abstract apiKey: string | undefined
  
  abstract isAvailable(): boolean
  abstract chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>
  abstract getUsage(): Promise<UsageInfo>
  
  protected normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(msg => ({
      role: msg.role || 'user',
      content: msg.content || ''
    }))
  }
}