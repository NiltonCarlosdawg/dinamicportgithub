import { Queue, Worker } from 'bullmq'
import { getRedisClient } from '../lib/redis.client'
import { statsService } from '../modules/stats/stats.service'

const connection = getRedisClient()

export const githubSyncQueue = new Queue('github-sync', { connection })

export const githubSyncWorker = new Worker(
  'github-sync',
  async () => {
    console.log('[GitHub Sync] Iniciando sincronização...')
    try {
      const result = await statsService.sync()
      console.log(`[GitHub Sync] Concluído. Repos: ${result.totalRepos}, Stars: ${result.totalStars}, Commits: ${result.totalCommits}`)
    } catch (err) {
      console.error('[GitHub Sync] Erro:', err)
      throw err
    }
  },
  { connection }
)

export async function scheduleGitHubSync() {
  await githubSyncQueue.add('immediate-sync', {}, { priority: 1 })

  const repeatableJobs = await githubSyncQueue.getRepeatableJobs()
  const exists = repeatableJobs.some((j) => j.pattern === '0 */6 * * *')

  if (!exists) {
    await githubSyncQueue.add('cron-sync', {}, {
      repeat: { pattern: '0 */6 * * *' },
    })
    console.log('[GitHub Sync] Cron agendado: 0 */6 * * *')
  }

  console.log('[GitHub Sync] Worker iniciado.')
}
