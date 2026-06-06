import { Elysia, t } from 'elysia'
import { experienceService } from './experience.service'
import { env } from '../../config/env'

function isAdmin({ request, set }: { request: Request; set: { status?: number } }) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${env.ADMIN_SECRET}`) {
    set.status = 401
    return { error: 'Unauthorized' }
  }
}

export const experienceRouter = new Elysia({ prefix: '/experience' })
  .get('/', async () => experienceService.findAll(), {
    detail: { summary: 'Toda a experiência ordenada', tags: ['experience'] },
  })
  .get('/current', async () => experienceService.findCurrent(), {
    detail: { summary: 'Cargos actuais', tags: ['experience'] },
  })
  .get('/:id', async ({ params: { id } }) => {
    const exp = await experienceService.findById(id)
    if (!exp) return { error: 'Experiência não encontrada' }
    return exp
  }, {
    params: t.Object({ id: t.String() }),
    detail: { summary: 'Detalhe por ID', tags: ['experience'] },
  })
  .guard({ beforeHandle: [isAdmin] }, (app) =>
    app
      .post('/', async ({ body }) => experienceService.create(body), {
        body: t.Object({
          company: t.String(),
          role: t.String(),
          description: t.String(),
          startDate: t.String(),
          endDate: t.Optional(t.String()),
          current: t.Optional(t.Boolean()),
          companyUrl: t.Optional(t.String()),
          location: t.Optional(t.String()),
          stack: t.Optional(t.Array(t.String())),
          sortOrder: t.Optional(t.String()),
        }),
        detail: { summary: 'Criar entrada de experiência', tags: ['experience'] },
      })
      .patch('/:id', async ({ params: { id }, body }) => {
        const result = await experienceService.update(id, body)
        if (!result) return { error: 'Experiência não encontrada' }
        return result
      }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
          company: t.Optional(t.String()),
          role: t.Optional(t.String()),
          description: t.Optional(t.String()),
          startDate: t.Optional(t.String()),
          endDate: t.Optional(t.String()),
          current: t.Optional(t.Boolean()),
          companyUrl: t.Optional(t.String()),
          location: t.Optional(t.String()),
          stack: t.Optional(t.Array(t.String())),
          sortOrder: t.Optional(t.String()),
        }),
        detail: { summary: 'Actualizar entrada de experiência', tags: ['experience'] },
      })
      .delete('/:id', async ({ params: { id } }) => {
        const result = await experienceService.remove(id)
        if (!result) return { error: 'Experiência não encontrada' }
        return { message: 'Experiência removida', id }
      }, {
        params: t.Object({ id: t.String() }),
        detail: { summary: 'Remover entrada de experiência', tags: ['experience'] },
      })
  )
