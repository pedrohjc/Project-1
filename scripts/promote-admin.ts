import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.log('Uso: npx tsx scripts/promote-admin.ts seu@email.com')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    console.log(`Usuário com e-mail "${email}" não encontrado.`)
    console.log('\nUsuários existentes:')
    const users = await prisma.user.findMany({ select: { email: true, role: true } })
    users.forEach((u) => console.log(`  ${u.email} (${u.role})`))
    process.exit(1)
  }

  if (user.role === 'admin') {
    console.log(`"${email}" já é admin.`)
    process.exit(0)
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  })

  console.log(`Pronto! "${email}" agora é admin.`)
  console.log(`Acesse: http://localhost:3000/admin`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
