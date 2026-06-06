import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { env } from './config/env'
import { projectsRouter } from './modules/projects/router'
import { stacksRouter } from './modules/stacks/router'
import { experienceRouter } from './modules/experience/router'
import { statsRouter } from './modules/stats/router'
import { scheduleGitHubSync } from './jobs/github-sync.job'

const app = new Elysia()
  .use(
    swagger({
      path: '/docs',
      documentation: {
        info: {
          title: 'Portfolio API',
          version: '1.0.0',
          description: 'API dinâmica do portfolio de Nilton Carlos Domingas Da Costa',
        },
        tags: [
          { name: 'projects', description: 'Projectos' },
          { name: 'stacks', description: 'Stacks tecnológicas' },
          { name: 'experience', description: 'Experiência profissional' },
          { name: 'stats', description: 'Estatísticas do GitHub' },
        ],
      },
    })
  )
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }), {
    detail: { summary: 'Status da API', tags: ['health'] },
  })
  .use(projectsRouter)
  .use(stacksRouter)
  .use(experienceRouter)
  .use(statsRouter)
  .listen(env.PORT)

console.log(`🦊 Portfolio API running at http://localhost:${env.PORT}`)
console.log(`📚 Swagger docs at http://localhost:${env.PORT}/docs`)

// Start GitHub sync job
scheduleGitHubSync().catch(console.error)

export type App = typeof app
