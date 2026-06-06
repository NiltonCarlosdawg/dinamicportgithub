import { Elysia, t } from 'elysia'
import { statsService } from './stats.service'
import { env } from '../../config/env'

function isAdmin({ request, set }: { request: Request; set: { status?: number } }) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${env.ADMIN_SECRET}`) {
    set.status = 401
    return { error: 'Unauthorized' }
  }
}

export const statsRouter = new Elysia({ prefix: '/stats' })
  .get('/', async () => statsService.getStats(), {
    detail: { summary: 'Estatísticas completas do GitHub', tags: ['stats'] },
  })
  .get('/languages', async () => statsService.getLanguages(), {
    detail: { summary: 'Top linguagens em %', tags: ['stats'] },
  })
  .get('/contributions', async ({ query }) => statsService.getContributions(query.weeks ? parseInt(query.weeks) : 52), {
    query: t.Object({
      weeks: t.Optional(t.String()),
    }),
    detail: { summary: 'Contribution map', tags: ['stats'] },
  })
  .guard({ beforeHandle: [isAdmin] }, (app) =>
    app.post('/sync', async () => {
      const result = await statsService.sync()
      return { message: 'Sincronização concluída', data: result }
    }, {
      detail: { summary: 'Forçar sync com GitHub', tags: ['stats'] },
    })
  )
