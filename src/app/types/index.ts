// types/index.ts

// ===== CORE ENTITY TYPES =====

export interface User {
  id: string
  email: string
  name?: string | null
  password?: string | null
  createdAt: Date
  updatedAt: Date
  emailVerified?: Date | null
  image?: string | null
}

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: Date | null
  priority?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
  aiSuggested: boolean
  aiApproved?: boolean | null
}

export interface Goal {
  id: string
  title: string
  description?: string | null
  targetDate?: Date | null
  progress: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
  userId: string
  aiSuggested: boolean
  aiApproved?: boolean | null
}

export interface Habit {
  id: string
  title: string
  description?: string | null
  frequency: string
  streak: number
  active: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  aiSuggested: boolean
  aiApproved?: boolean | null
}

export interface Journal {
  id: string
  title: string
  content: string
  mood?: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  userId: string
  aiAnalysis?: string | null
}

// Define possible detail types for AILog
export type AILogDetails = 
  | TaskFormData
  | GoalFormData
  | HabitFormData
  | JournalFormData
  | { message: string; [key: string]: unknown }
  | { [key: string]: unknown }

export interface AILog {
  id: string
  action: string
  entityType: string
  entityId?: string | null
  details: AILogDetails // Fixed: Replaced any with proper type
  approved?: boolean | null
  createdAt: Date
  userId: string
}

// ===== NEXTAUTH TYPES =====

export interface Account {
  id: string
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
}

export interface Session {
  id: string
  sessionToken: string
  userId: string
  expires: Date
}

// ===== ENUM/UNION TYPES =====

export type TaskPriority = 'low' | 'medium' | 'high'
export type HabitFrequency = 'daily' | 'weekly' | 'monthly'
export type JournalMood = 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'grateful' | 'frustrated' | 'peaceful'
export type AILogAction = 'create' | 'update' | 'delete' | 'suggest' | 'approve' | 'reject' | 'chat'
export type AILogEntityType = 'task' | 'goal' | 'habit' | 'journal' | 'conversation'
export type FormFieldType = 'text' | 'textarea' | 'email' | 'password' | 'number'
export type OnboardingStepType = 'text' | 'choice' | 'multiChoice'
export type AINotificationType = 'task_suggestion' | 'habit_reminder' | 'insight' | 'completion' | 'goal_reminder' | 'achievement'

// ===== FORM DATA INTERFACES =====

export interface TaskFormData {
  title: string
  description: string
  dueDate: string | null
  priority: TaskPriority | null
  completed?: boolean
}

export interface GoalFormData {
  title: string
  description: string
  targetDate: string | null
  progress: number
}

export interface HabitFormData {
  title: string
  description: string
  frequency: HabitFrequency
  active: boolean
}

export interface JournalFormData {
  title: string
  content: string
  mood?: JournalMood | string
  tags: string[]
}

// ===== AI & CHAT TYPES =====

export interface AIFunction {
  name: string
  description?: string
  parameters?: Record<string, unknown>
  executed?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  functions?: AIFunction[]
  status?: 'pending' | 'approved' | 'rejected'
}

export interface ChatResponse {
  content?: string
  message?: string
  functions?: AIFunction[]
  error?: string
}

export interface AIHistoryDetails {
  title?: string
  message?: string
  provider?: string
  [key: string]: unknown
}

// ===== AI NOTIFICATION TYPES =====

interface BaseNotificationData {
  id: string
  message: string
}

interface TaskSuggestionData extends BaseNotificationData {
  task: {
    title: string
    description?: string
    dueDate?: Date | string
    priority?: TaskPriority
  }
}

interface HabitReminderData extends BaseNotificationData {
  habitId: string
  habitName: string
  streak?: number
}

interface InsightData extends BaseNotificationData {
  category?: string
  metrics?: Record<string, number>
}

interface CompletionData extends BaseNotificationData {
  entityType: 'task' | 'goal' | 'habit'
  entityId: string
  completedCount?: number
}

// Goal suggestion data type
export interface GoalSuggestionData extends BaseNotificationData {
  goal: {
    title: string
    description?: string
    targetDate?: Date | string
  }
}

export type AINotificationData = 
  | { type: 'task_suggestion'; data: TaskSuggestionData }
  | { type: 'habit_reminder'; data: HabitReminderData }
  | { type: 'insight'; data: InsightData }
  | { type: 'completion'; data: CompletionData }
  | { type: 'goal_reminder'; data: BaseNotificationData }
  | { type: 'goal_suggestion'; data: GoalSuggestionData }
  | { type: 'achievement'; data: BaseNotificationData }

export interface AINotificationEvent {
  type: AINotificationType
  data: BaseNotificationData & Record<string, unknown>
}

export interface AINotificationMetadata {
  priority: 'low' | 'medium' | 'high'
  requiresAction: boolean
  timestamp?: Date
}

// Fixed: Properly typed AINotification with discriminated union
export type AINotification = 
| {
    type: 'task_suggestion'
    data: TaskSuggestionData
    metadata: AINotificationMetadata
  }
| {
    type: 'habit_reminder'
    data: HabitReminderData
    metadata: AINotificationMetadata
  }
| {
    type: 'insight'
    data: InsightData
    metadata: AINotificationMetadata
  }
| {
    type: 'completion'
    data: CompletionData
    metadata: AINotificationMetadata
  }
| {
    type: 'goal_reminder'
    data: BaseNotificationData
    metadata: AINotificationMetadata
  }
| {
    type: 'goal_suggestion'
    data: GoalSuggestionData
    metadata: AINotificationMetadata
  }
| {
    type: 'achievement'
    data: BaseNotificationData
    metadata: AINotificationMetadata
  }
export interface AINotificationMethods {
  showAISuggestion: (params: {
    id: string
    type: 'suggestion' | 'reminder'
    title: string
    message: string
    actionType?: string
    actionData?: unknown
    onApprove?: () => void | Promise<void>
    onReject?: () => void | Promise<void>
  }) => void
  showAIAction: (message: string, status: 'success' | 'error' | 'warning' | 'info') => void
  showAIInsight: (message: string) => void
}

// ===== SOCKET TYPES =====

export interface AISocketEvent {
  entity: string
  type?: string
  id?: string
  [key: string]: unknown
}

export interface SocketEventMap {
  // Connection events
  'connect': void
  'disconnect': void
  
  // AI events
  'ai:suggestion:new': AINotificationEvent
  'ai:analyzing': AISocketEvent
  'ai:processing': { message?: string }
  
  // Entity events
  'task:created': Task
  'task:updated': Task
  'task:deleted': { id: string }
  
  'goal:created': Goal
  'goal:updated': Goal
  'goal:deleted': { id: string }
  
  'habit:created': Habit
  'habit:updated': Habit
  'habit:deleted': { id: string }
  
  'journal:created': Journal
  'journal:updated': Journal
  'journal:deleted': { id: string }
  
  // Generic events
  'sync:start': { entities: string[] }
  'sync:complete': { entities: string[], count: number }
  'error': { message: string, code?: string }
  
  [key: string]: unknown
}

export type SocketEmitData<K extends keyof SocketEventMap = keyof SocketEventMap> = 
  SocketEventMap[K]

// ===== ONBOARDING TYPES =====

export interface OnboardingStep {
  id: string
  question: string
  type: OnboardingStepType
  options?: string[]
  key: string
}

export interface OnboardingMessage {
  role: 'ai' | 'user'
  content: string
}

export type OnboardingResponse = string | string[]

export interface OnboardingResponses {
  name?: string
  goals?: string[]
  challenge?: string
  productiveTime?: string
  aiMode?: string
  [key: string]: OnboardingResponse | undefined
}

export interface OnboardingApiResponse {
  tasksCreated: number
  goalsCreated: number
  success: boolean
  message?: string
}

// ===== FORM TYPES =====

// Fixed: Replaced any with unknown for more type safety
export interface FormField<T extends Record<string, unknown> = Record<string, unknown>> {
  name: keyof T & string
  label: string
  type: FormFieldType
  placeholder?: string
  required?: boolean
}

// Fixed: Replaced any with unknown for type safety
export type FormData = Record<string, unknown>

// ===== UTILITY TYPES =====

export type CreateTaskInput = Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'aiSuggested' | 'aiApproved'>
export type UpdateTaskInput = Partial<CreateTaskInput>

export type CreateGoalInput = Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'completed'>
export type UpdateGoalInput = Partial<CreateGoalInput>

// ... continuing from where it was cut off

export type CreateHabitInput = Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak' | 'aiSuggested' | 'aiApproved'>
export type UpdateHabitInput = Partial<CreateHabitInput>

export type CreateJournalInput = Omit<Journal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'aiAnalysis'>
export type UpdateJournalInput = Partial<CreateJournalInput>

// AI Provider types
export interface AIProvider {
  name: string
  apiKey: string | undefined
  isAvailable(): boolean
  chat(messages: AIProviderChatMessage[], options?: AIChatOptions): Promise<AIProviderChatResponse>
  getUsage(): Promise<AIUsageInfo>
}

export interface AIProviderChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIChatOptions {
  temperature?: number
  maxTokens?: number
  functions?: AIFunctionDefinition[]
}

export interface AIProviderChatResponse {
  content: string
  functions?: AIFunctionCall[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIFunctionDefinition {
  name: string
  description: string
  parameters: AIFunctionParameters
}

export interface AIFunctionCall {
  name: string
  arguments: Record<string, unknown> | string
}

export interface AIUsageInfo {
  used: number
  limit: number
  remaining: number
}

// JSON Schema types for function parameters
export interface AIFunctionParameters {
  type: 'object'
  properties: Record<string, AIPropertySchema>
  required?: string[]
}

export interface AIPropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: unknown[]
  items?: AIPropertySchema
  properties?: Record<string, AIPropertySchema>
  default?: unknown
}

// Fixed: Replaced any with proper typed parameters
export type SocketEventHandler<T = unknown> = (data: T) => void | Promise<void>

// Additional type for specific socket event handlers
export type TypedSocketEventHandler<K extends keyof SocketEventMap> = 
  SocketEventHandler<SocketEventMap[K]>