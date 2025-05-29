import { HfInference } from '@huggingface/inference'
import { BaseAIProvider, ChatMessage, ChatOptions, ChatResponse } from './base'

export class HuggingFaceProvider extends BaseAIProvider {
  name = 'Hugging Face'
  apiKey = process.env.HUGGINGFACE_API_KEY
  private client: HfInference | null = null

  constructor() {
    super()
    if (this.apiKey) {
      this.client = new HfInference(this.apiKey)
    }
  }

  isAvailable(): boolean {
    return !!this.apiKey && !!this.client
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    if (!this.client) throw new Error('HuggingFace client not initialized')

    // Convert messages to prompt
    const prompt = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n') + '\nassistant:'

    const response = await this.client.textGeneration({
      model: 'meta-llama/Llama-2-7b-chat-hf',
      inputs: prompt,
      parameters: {
        max_new_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        return_full_text: false
      }
    })

    return {
      content: response.generated_text,
      functions: [], // HF doesn't support function calling directly
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      }
    }
  }

  async getUsage(): Promise<UsageInfo> {
    return {
      used: 0,
      limit: 1000, // Free tier limits
      remaining: 1000
    }
  }
}