import { createCrudHandlers } from '@/app/lib/crudHandler'

const handlers = createCrudHandlers({ model: 'habit' })

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  return handlers.update(req, params.id)
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  return handlers.remove(req, params.id)
}