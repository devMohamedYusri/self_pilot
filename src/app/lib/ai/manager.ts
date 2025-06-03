import { AIProvider, ChatMessage, ChatOptions, ChatResponse } from './providers/base'
import { OpenAIProvider } from './providers/openai'
import { GeminiProvider } from './providers/gemini'
import { HuggingFaceProvider } from './providers/huggingface'
import { prisma } from '@/app/lib/prisma'

export class AIManager {
  private providers: AIProvider[] = []
  private currentProviderIndex = 0

  constructor() {
    // Initialize providers in priority order
    this.providers = [
      new OpenAIProvider(),
      new GeminiProvider(),
      new HuggingFaceProvider(),
    ].filter(p => p.isAvailable())
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse & { provider: string }> {
    if (this.providers.length === 0) {
      throw new Error('No AI providers available')
    }

    // Try each provider until one succeeds
    for (let i = 0; i < this.providers.length; i++) {
      const providerIndex = (this.currentProviderIndex + i) % this.providers.length
      const provider = this.providers[providerIndex]

      try {
        // Check usage limits
        const usage = await provider.getUsage()
        if (usage.remaining <= 0) {
          continue // Skip this provider
        }

        // Attempt chat
        const response = await provider.chat(messages, options)
        
        // Log successful usage
        await this.logUsage(provider.name, messages, response)
        
        return {
          ...response,
          provider: provider.name
        }
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error)
        continue // Try next provider
      }
    }

    throw new Error('All AI providers failed')
  }

  private async logUsage(provider: string, messages: ChatMessage[], response: ChatResponse) {
    try {
      await prisma.aILog.create({
        data: {
          action: 'chat',
          entityType: 'conversation',
          details: {
            provider,
            messageCount: messages.length,
            hasFunction: !!response.functions?.length,
            usage: response.usage
          },
          userId: 'system' // This should be replaced with actual user ID
        }
      })
    } catch (error) {
      console.error('Failed to log AI usage:', error)
    }
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name)
  }
}