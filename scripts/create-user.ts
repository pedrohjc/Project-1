import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { isAdminEmail } from '../lib/admin'

const prisma = new PrismaClient()

async function main() {
  const email = 'pedrohj.carvalho@gmail.com'
  const password = '112233'
  const name = 'Pedro Carvalho'

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('❌ Usuário já existe com este email!')
    return
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10)

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: isAdminEmail(email) ? 'admin' : 'user',
    },
  })

  console.log('✅ Usuário criado com sucesso!')
  console.log('📧 Email:', user.email)
  console.log('👤 Nome:', user.name)
  console.log('🆔 ID:', user.id)
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

