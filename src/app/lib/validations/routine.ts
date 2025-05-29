import { z } from 'zod'

export const routineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  time: z.string(),
  daysOfWeek: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])),
  isActive: z.boolean(),
  duration: z.number().min(1).max(480).optional(),
  reminder: z.boolean(),
  reminderTime: z.number().min(1).max(60).optional(),
  habitIds: z.array(z.string()).optional(),
  taskIds: z.array(z.string()).optional(),
})

export type RoutineFormData = z.infer<typeof routineSchema> 