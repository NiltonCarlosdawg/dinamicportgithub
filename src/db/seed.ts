import { db } from './index'
import { stacks, stackCategoryEnum, stackLevelEnum } from './schema/stacks'
import { projects, projectStatusEnum, projectsToStacks } from './schema/projects'
import { experience } from './schema/experience'

async function seed() {
  console.log('🌱 Seeding database...')

  // ── Stacks ──
  const stacksData = [
    { name: 'React', slug: 'react', category: 'frontend' as const, level: 'expert' as const, color: '#61DAFB', yearsExp: 4, featured: true, sortOrder: 1 },
    { name: 'TypeScript', slug: 'typescript', category: 'frontend' as const, level: 'expert' as const, color: '#3178C6', yearsExp: 3, featured: true, sortOrder: 2 },
    { name: 'Next.js', slug: 'nextjs', category: 'frontend' as const, level: 'advanced' as const, color: '#000000', yearsExp: 3, featured: true, sortOrder: 3 },
    { name: 'React Native', slug: 'react-native', category: 'mobile' as const, level: 'advanced' as const, color: '#61DAFB', yearsExp: 3, featured: true, sortOrder: 1 },
    { name: 'Expo', slug: 'expo', category: 'mobile' as const, level: 'advanced' as const, color: '#000020', yearsExp: 2, featured: false, sortOrder: 2 },
    { name: 'NativeWind', slug: 'nativewind', category: 'mobile' as const, level: 'proficient' as const, color: '#06B6D4', yearsExp: 1, featured: false, sortOrder: 3 },
    { name: 'Node.js', slug: 'nodejs', category: 'backend' as const, level: 'expert' as const, color: '#339933', yearsExp: 4, featured: true, sortOrder: 1 },
    { name: 'Bun', slug: 'bun', category: 'backend' as const, level: 'advanced' as const, color: '#F9F9F9', yearsExp: 1, featured: false, sortOrder: 2 },
    { name: 'Elysia', slug: 'elysia', category: 'backend' as const, level: 'advanced' as const, color: '#0077B6', yearsExp: 1, featured: false, sortOrder: 3 },
    { name: 'Fastify', slug: 'fastify', category: 'backend' as const, level: 'proficient' as const, color: '#000000', yearsExp: 2, featured: false, sortOrder: 4 },
    { name: 'Laravel', slug: 'laravel', category: 'backend' as const, level: 'proficient' as const, color: '#FF2D20', yearsExp: 2, featured: false, sortOrder: 5 },
    { name: 'Python', slug: 'python', category: 'backend' as const, level: 'proficient' as const, color: '#3776AB', yearsExp: 2, featured: false, sortOrder: 6 },
    { name: 'PostgreSQL', slug: 'postgresql', category: 'database' as const, level: 'advanced' as const, color: '#4169E1', yearsExp: 3, featured: true, sortOrder: 1 },
    { name: 'Drizzle', slug: 'drizzle', category: 'database' as const, level: 'proficient' as const, color: '#C5F74F', yearsExp: 1, featured: false, sortOrder: 2 },
    { name: 'Prisma', slug: 'prisma', category: 'database' as const, level: 'proficient' as const, color: '#2D3748', yearsExp: 2, featured: false, sortOrder: 3 },
    { name: 'Redis', slug: 'redis', category: 'database' as const, level: 'proficient' as const, color: '#DC382D', yearsExp: 2, featured: false, sortOrder: 4 },
    { name: 'BullMQ', slug: 'bullmq', category: 'messaging' as const, level: 'proficient' as const, color: '#C72A49', yearsExp: 1, featured: false, sortOrder: 1 },
    { name: 'Socket.IO', slug: 'socket-io', category: 'messaging' as const, level: 'proficient' as const, color: '#010101', yearsExp: 2, featured: false, sortOrder: 2 },
    { name: 'Anthropic API', slug: 'anthropic-api', category: 'ai_ml' as const, level: 'advanced' as const, color: '#0099FF', yearsExp: 1, featured: true, sortOrder: 1 },
    { name: 'WhatsApp API', slug: 'whatsapp-api', category: 'messaging' as const, level: 'advanced' as const, color: '#25D366', yearsExp: 2, featured: false, sortOrder: 3 },
    { name: 'Baileys', slug: 'baileys', category: 'messaging' as const, level: 'proficient' as const, color: '#25D366', yearsExp: 1, featured: false, sortOrder: 4 },
    { name: 'Linux', slug: 'linux', category: 'devops' as const, level: 'proficient' as const, color: '#FCC624', yearsExp: 3, featured: false, sortOrder: 1 },
    { name: 'Docker', slug: 'docker', category: 'devops' as const, level: 'proficient' as const, color: '#2496ED', yearsExp: 2, featured: false, sortOrder: 2 },
    { name: 'Tailwind CSS', slug: 'tailwind', category: 'frontend' as const, level: 'expert' as const, color: '#06B6D4', yearsExp: 3, featured: true, sortOrder: 4 },
    { name: 'Go', slug: 'go', category: 'backend' as const, level: 'familiar' as const, color: '#00ADD8', yearsExp: 0, featured: false, sortOrder: 7 },
  ]

  for (const stack of stacksData) {
    await db.insert(stacks).values(stack).onConflictDoNothing()
  }
  console.log(`  ✅ ${stacksData.length} stacks inseridas`)

  // ── Experience ──
  const experienceData = [
    {
      company: 'VERANO Labs',
      role: 'COO & Tech Lead',
      description: 'Liderança técnica e operacional da startup. Gestão de equipa, arquitectura de sistemas, desenvolvimento fullstack e definição de roadmap de produto.',
      startDate: 'Jan 2025',
      endDate: null,
      current: true,
      location: 'Luanda, Angola',
      stack: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'Anthropic API'],
      sortOrder: '1',
    },
    {
      company: 'MilVendas',
      role: 'Fullstack Developer',
      description: 'Desenvolvimento de plataforma de vendas com Laravel e Vue.js. Integração com APIs de pagamento e gestão de equipa de desenvolvimento.',
      startDate: 'Jun 2023',
      endDate: 'Dez 2024',
      current: false,
      location: 'Luanda, Angola',
      stack: ['Laravel', 'Vue.js', 'MySQL', 'Redis', 'Docker'],
      sortOrder: '2',
    },
    {
      company: 'CalungaSoft',
      role: 'Software Developer',
      description: 'Desenvolvimento de sistemas web e mobile para clientes institucionais. Manutenção de aplicações legadas e modernização de infraestrutura.',
      startDate: 'Jan 2022',
      endDate: 'Mai 2023',
      current: false,
      location: 'Luanda, Angola',
      stack: ['React', 'Node.js', 'PostgreSQL', 'Python', 'Docker'],
      sortOrder: '3',
    },
  ]

  for (const exp of experienceData) {
    await db.insert(experience).values(exp).onConflictDoNothing()
  }
  console.log(`  ✅ ${experienceData.length} experiências inseridas`)

  // ── Projects ──
  const projectsData = [
    {
      name: 'KAMBA Finance',
      slug: 'kamba-finance',
      description: 'Assistente financeiro com IA para gestão de finanças pessoais e empresariais em Angola.',
      longDesc: 'O KAMBA Finance é uma plataforma completa de gestão financeira que utiliza IA para fornecer insights, previsões e recomendações personalizadas. Suporta múltiplas moedas, integração bancária via API, e relatórios inteligentes.',
      status: 'in_development' as const,
      githubUrl: 'https://github.com/NiltonCarlosdawg/kamba',
      featured: true,
      stars: '12',
      forks: '3',
      language: 'TypeScript',
      topics: ['react', 'typescript', 'ai', 'fintech'],
      sortOrder: '1',
    },
    {
      name: 'PedeJá',
      slug: 'pedeja',
      description: 'Plataforma de pedidos e delivery para restaurantes em Luanda.',
      longDesc: 'O PedeJá conecta clientes a restaurantes locais permitindo fazer pedidos, pagamentos integrados e acompanhamento em tempo real. Inclui dashboard para gestão de menus, pedidos e relatórios de vendas.',
      status: 'completed' as const,
      githubUrl: 'https://github.com/NiltonCarlosdawg/pedeja',
      featured: true,
      stars: '8',
      forks: '2',
      language: 'TypeScript',
      topics: ['react-native', 'node', 'delivery', 'payments'],
      sortOrder: '2',
    },
    {
      name: 'QRinvite',
      slug: 'qrinvite',
      description: 'Sistema de convites digitais com QR code para eventos.',
      longDesc: 'O QRinvite permite criar, gerir e validar convites digitais para eventos. Cada convite tem um QR code único, tracking de confirmações e dashboard em tempo real.',
      status: 'completed' as const,
      githubUrl: 'https://github.com/NiltonCarlosdawg/qrinvite',
      featured: false,
      stars: '5',
      forks: '1',
      language: 'TypeScript',
      topics: ['react', 'node', 'qr-code', 'events'],
      sortOrder: '3',
    },
    {
      name: 'UNIPASS',
      slug: 'unipass',
      description: 'Sistema de gestão de senhas universitário com integração académica.',
      longDesc: 'O UNIPASS é um sistema de agendamento e gestão de senhas para serviços universitários. Integra-se com sistemas académicos existentes e fornece relatórios de atendimento.',
      status: 'paused' as const,
      githubUrl: 'https://github.com/NiltonCarlosdawg/unipass',
      featured: false,
      stars: '3',
      forks: '1',
      language: 'PHP',
      topics: ['laravel', 'php', 'university', 'management'],
      sortOrder: '4',
    },
  ]

  for (const project of projectsData) {
    await db.insert(projects).values(project).onConflictDoNothing()
  }
  console.log(`  ✅ ${projectsData.length} projectos inseridos`)

  console.log('🎉 Seed completo!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Erro no seed:', err)
  process.exit(1)
})
