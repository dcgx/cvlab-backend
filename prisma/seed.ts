import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_USER_EMAIL = 'dev@cvlab.local'
const DEFAULT_USER_PASSWORD = 'dev-password-change-in-prod'

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: DEFAULT_USER_EMAIL },
  })
  if (existing) {
    console.log('Default user already exists:', existing.id)
    return
  }
  const user = await prisma.user.create({
    data: {
      email: DEFAULT_USER_EMAIL,
      password: DEFAULT_USER_PASSWORD, // Opcional con Supabase Auth
      name: 'Usuario desarrollo',
    },
  })
  console.log('Created default user:', user.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
