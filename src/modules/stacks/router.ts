import { Elysia, t } from 'elysia'
import { stacksService } from './stacks.service'
import { env } from '../../config/env'

function isAdmin({ request, set }: { request: Request; set: { status?: number } }) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${env.ADMIN_SECRET}`) {
    set.status = 401
    return { error: 'Unauthorized' }
  }
}

export const stacksRouter = new Elysia({ prefix: '/stacks' })
  .get('/', async ({ query }) => stacksService.findAll(query), {
    query: t.Object({
      category: t.Optional(t.String()),
      featured: t.Optional(t.String()),
    }),
    detail: { summary: 'Lista todas as stacks', tags: ['stacks'] },
  })
  .get('/grouped', async () => stacksService.findGrouped(), {
    detail: { summary: 'Stacks agrupadas por categoria', tags: ['stacks'] },
  })
  .get('/:slug', async ({ params: { slug } }) => {
    const stack = await stacksService.findBySlug(slug)
    if (!stack) return { error: 'Stack não encontrada' }
    return stack
  }, {
    params: t.Object({ slug: t.String() }),
    detail: { summary: 'Detalhe por slug', tags: ['stacks'] },
  })
  .guard({ beforeHandle: [isAdmin] }, (app) =>
    app
      .post('/', async ({ body }) => stacksService.create(body), {
        body: t.Object({
          name: t.String(),
          slug: t.String(),
          category: t.String(),
          level: t.String(),
          iconUrl: t.Optional(t.String()),
          color: t.Optional(t.String()),
          yearsExp: t.Optional(t.Number()),
          featured: t.Optional(t.Boolean()),
          sortOrder: t.Optional(t.Number()),
        }),
        detail: { summary: 'Criar stack', tags: ['stacks'] },
      })
      .patch('/:id', async ({ params: { id }, body }) => {
        const result = await stacksService.update(id, body)
        if (!result) return { error: 'Stack não encontrada' }
        return result
      }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
          name: t.Optional(t.String()),
          slug: t.Optional(t.String()),
          category: t.Optional(t.String()),
          level: t.Optional(t.String()),
          iconUrl: t.Optional(t.String()),
          color: t.Optional(t.String()),
          yearsExp: t.Optional(t.Number()),
          featured: t.Optional(t.Boolean()),
          sortOrder: t.Optional(t.Number()),
        }),
        detail: { summary: 'Actualizar stack', tags: ['stacks'] },
      })
      .delete('/:id', async ({ params: { id } }) => {
        const result = await stacksService.remove(id)
        if (!result) return { error: 'Stack não encontrada' }
        return { message: 'Stack removida', id }
      }, {
        params: t.Object({ id: t.String() }),
        detail: { summary: 'Remover stack', tags: ['stacks'] },
      })
  )
