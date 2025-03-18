import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    // Criar permissões padrão
    const adminPermission = await prisma.permission.upsert({
      where: { id: '1' },
      update: { role: 'ADMIN' },
      create: {
        id: '1',
        role: 'ADMIN',
      }
    })

    const userPermission = await prisma.permission.upsert({
      where: { id: '2' },
      update: { role: 'USER' },
      create: {
        id: '2',
        role: 'USER',
      }
    })

    console.log('✅ Permissões criadas:', { adminPermission, userPermission })

    // Criar usuário admin padrão
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@admin.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@admin.com',
        password: '$2a$12$VzyiYB1dcMrwIhyYQVld.O.lGk2CwinYQUz7EnodiLf0ecZKg9fOa', // senha: admin123
        cpf: '11111111111',
        avatar: 'default.png',
        permission_id: adminPermission.id
      }
    })

    // Criar primeiro usuário normal
    const user1 = await prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: {},
      create: {
        name: 'Usuário Um',
        email: 'user1@example.com',
        password: '$2a$12$VzyiYB1dcMrwIhyYQVld.O.lGk2CwinYQUz7EnodiLf0ecZKg9fOa', // senha: admin123
        cpf: '22222222222',
        avatar: 'default.png',
        permission_id: userPermission.id
      }
    })

    // Criar segundo usuário normal
    const user2 = await prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        name: 'Usuário Dois',
        email: 'user2@example.com',
        password: '$2a$12$VzyiYB1dcMrwIhyYQVld.O.lGk2CwinYQUz7EnodiLf0ecZKg9fOa', // senha: admin123
        cpf: '33333333333',
        avatar: 'default.png',
        permission_id: userPermission.id
      }
    })

    // Criar terceiro usuário normal
    const user3 = await prisma.user.upsert({
      where: { email: 'user3@example.com' },
      update: {},
      create: {
        name: 'Usuário Três',
        email: 'user3@example.com',
        password: '$2a$12$VzyiYB1dcMrwIhyYQVld.O.lGk2CwinYQUz7EnodiLf0ecZKg9fOa', // senha: admin123
        cpf: '44444444444',
        avatar: 'default.png',
        permission_id: userPermission.id
      }
    })

    console.log('✅ Usuários criados com sucesso!')
    console.log('👤 Admin:', adminUser.email)
    console.log('👤 Usuário 1:', user1.email)
    console.log('👤 Usuário 2:', user2.email)
    console.log('👤 Usuário 3:', user3.email)
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 