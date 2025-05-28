import { createCrudHandlers } from '@/lib/crudHandler'

const handlers = createCrudHandlers({ model: 'habit' })

export const GET = handlers.getAll
export const POST = handlers.create