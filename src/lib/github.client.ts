import { Octokit } from 'octokit'
import { env } from '../config/env'

let octokit: Octokit

export function getGitHubClient(): Octokit {
  if (!octokit) {
    octokit = new Octokit({ auth: env.GITHUB_TOKEN })
  }
  return octokit
}

interface GitHubUserStats {
  username: string
  totalRepos: number
  totalCommits: number
  totalStars: number
  totalForks: number
  followers: number
  following: number
  topLanguages: Record<string, number>
  avatarUrl: string | null
  bio: string | null
}

export async function getUserStats(): Promise<GitHubUserStats> {
  const client = getGitHubClient()
  const { data: user } = await client.rest.users.getByUsername({ username: env.GITHUB_USER })

  const { data: repos } = await client.rest.repos.listForUser({
    username: env.GITHUB_USER,
    type: 'owner',
    sort: 'updated',
    per_page: 100,
  })

  const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0)
  const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0)

  const langBytes: Record<string, number> = {}
  const reposToProcess = repos.slice(0, 30)

  for (const repo of reposToProcess) {
    try {
      const { data: languages } = await client.rest.repos.getLanguages({
        owner: env.GITHUB_USER,
        repo: repo.name,
      })
      for (const [lang, bytes] of Object.entries(languages)) {
        langBytes[lang] = (langBytes[lang] || 0) + bytes
      }
    } catch {
      // skip repos with errors
    }
  }

  const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0)
  const topLanguages: Record<string, number> = {}
  for (const [lang, bytes] of Object.entries(langBytes)) {
    topLanguages[lang] = Math.round((bytes / totalBytes) * 1000) / 10
  }

  const currentYear = new Date().getFullYear()
  let totalCommits = 0
  try {
    const { data: searchResult } = await client.rest.search.commits({
      q: `author:${env.GITHUB_USER} committer-date:${currentYear}-01-01..${currentYear}-12-31`,
      per_page: 1,
    })
    totalCommits = searchResult.total_count
  } catch {
    // search commits may not be available for all token types
  }

  return {
    username: user.login,
    totalRepos: repos.length,
    totalCommits,
    totalStars,
    totalForks,
    followers: user.followers ?? 0,
    following: user.following ?? 0,
    topLanguages,
    avatarUrl: user.avatar_url,
    bio: user.bio,
  }
}
