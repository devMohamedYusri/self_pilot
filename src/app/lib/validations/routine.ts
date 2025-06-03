// app/lib/validations/routine.ts
import { z } from 'zod'

export const routineSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  timeOfDay: z.string().optional().default('morning'), // Changed from 'time' to match Prisma model
  active: z.boolean().optional().default(true), // Changed from 'isActive' to match Prisma model
  steps: z.array(z.any()).optional().default([]), // Added to match Prisma model
  habitIds: z.array(z.string()).optional(),
  taskIds: z.array(z.string()).optional(),
  aiSuggested: z.boolean().optional().default(false),
  aiApproved: z.boolean().optional()
})

export type RoutineFormData = z.infer<typeof routineSchema>