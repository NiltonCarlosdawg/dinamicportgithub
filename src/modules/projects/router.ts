import { Elysia, t } from 'elysia'
import { projectsService } from './projects.service'
import { env } from '../../config/env'

function isAdmin({ request, set }: { request: Request; set: { status?: number } }) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${env.ADMIN_SECRET}`) {
    set.status = 401
    return { error: 'Unauthorized. Use: Authorization: Bearer <ADMIN_SECRET>' }
  }
}

export const projectsRouter = new Elysia({ prefix: '/projects' })
  .get('/', async ({ query }) => projectsService.findAll(query), {
    query: t.Object({
      status: t.Optional(t.String()),
      featured: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
    }),
    detail: { summary: 'Lista todos os projectos', tags: ['projects'] },
  })
  .get('/featured', async () => projectsService.findFeatured(), {
    detail: { summary: 'Projectos em destaque', tags: ['projects'] },
  })
  .get('/in-development', async () => projectsService.findInDevelopment(), {
    detail: { summary: 'Projectos activos (in_development)', tags: ['projects'] },
  })
  .get('/:slug', async ({ params: { slug } }) => {
    const project = await projectsService.findBySlug(slug)
    if (!project) return { error: 'Projecto não encontrado' }
    return project
  }, {
    params: t.Object({ slug: t.String() }),
    detail: { summary: 'Detalhe por slug', tags: ['projects'] },
  })
  .guard({ beforeHandle: [isAdmin] }, (app) =>
    app
      .post('/', async ({ body }) => projectsService.create(body), {
        body: t.Object({
          name: t.String(),
          slug: t.String(),
          description: t.String(),
          longDesc: t.Optional(t.String()),
          status: t.Optional(t.String()),
          githubUrl: t.Optional(t.String()),
          liveUrl: t.Optional(t.String()),
          imageUrl: t.Optional(t.String()),
          featured: t.Optional(t.Boolean()),
          language: t.Optional(t.String()),
          topics: t.Optional(t.Array(t.String())),
          sortOrder: t.Optional(t.String()),
        }),
        detail: { summary: 'Criar projecto', tags: ['projects'] },
      })
      .patch('/:id', async ({ params: { id }, body }) => {
        const result = await projectsService.update(id, body)
        if (!result) return { error: 'Projecto não encontrado' }
        return result
      }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
          name: t.Optional(t.String()),
          slug: t.Optional(t.String()),
          description: t.Optional(t.String()),
          longDesc: t.Optional(t.String()),
          status: t.Optional(t.String()),
          githubUrl: t.Optional(t.String()),
          liveUrl: t.Optional(t.String()),
          imageUrl: t.Optional(t.String()),
          featured: t.Optional(t.Boolean()),
          language: t.Optional(t.String()),
          topics: t.Optional(t.Array(t.String())),
          sortOrder: t.Optional(t.String()),
        }),
        detail: { summary: 'Actualizar projecto', tags: ['projects'] },
      })
      .delete('/:id', async ({ params: { id } }) => {
        const result = await projectsService.remove(id)
        if (!result) return { error: 'Projecto não encontrado' }
        return { message: 'Projecto removido', id }
      }, {
        params: t.Object({ id: t.String() }),
        detail: { summary: 'Remover projecto', tags: ['projects'] },
      })
  )
