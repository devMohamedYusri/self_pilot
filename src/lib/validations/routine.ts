// lib/validations/routine.ts
import { z } from 'zod'

export const routineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  daysOfWeek: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])),
  isActive: z.boolean().default(true),
  habitIds: z.array(z.string()).optional(),
  taskIds: z.array(z.string()).optional(),
  duration: z.number().min(1).max(480).optional(), // Duration in minutes
  reminder: z.boolean().default(false),
  reminderTime: z.number().min(0).max(60).optional(), // Minutes before routine
})

export type RoutineFormData = z.infer<typeof routineSchema>