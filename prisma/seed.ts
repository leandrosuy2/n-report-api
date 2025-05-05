import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    // Criar permissões padrão
    const superAdminPermission = await prisma.permission.upsert({
      where: { id: '0' },
      update: { role: 'SUPERADMIN' },
      create: {
        id: '0',
        role: 'SUPERADMIN',
      }
    })

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

    const grupoDeRiscoPermission = await prisma.permission.upsert({
      where: { id: '3' },
      update: { role: 'GRUPO_DE_RISCO' },
      create: {
        id: '3',
        role: 'GRUPO_DE_RISCO',
      }
    })

    const guardinhaDaRuaPermission = await prisma.permission.upsert({
      where: { id: '4' },
      update: { role: 'GUARDINHA_DA_RUA' },
      create: {
        id: '4',
        role: 'GUARDINHA_DA_RUA',
      }
    })

    console.log('✅ Permissões criadas:', { 
      superAdminPermission, 
      adminPermission, 
      userPermission,
      grupoDeRiscoPermission,
      guardinhaDaRuaPermission
    })

    // Criar usuário superadmin padrão
    const superAdminUser = await prisma.user.upsert({
      where: { email: 'superadmin@admin.com' },
      update: {},
      create: {
        name: 'Super Administrador',
        email: 'superadmin@admin.com',
        password: '$2a$12$VzyiYB1dcMrwIhyYQVld.O.lGk2CwinYQUz7EnodiLf0ecZKg9fOa', // senha: admin123
        cpf: '00000000000',
        avatar: 'default.png',
        street: 'Rua Super Admin',
        number: '0',
        complement: 'Sala 0',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '00000000',
        documentPhoto: 'default.png',
        documentSelfie: 'default.png',
        documentVerified: true,
        permission_id: superAdminPermission.id
      }
    })

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
        street: 'Rua Administrador',
        number: '1',
        complement: 'Sala 1',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001000',
        documentPhoto: 'default.png',
        documentSelfie: 'default.png',
        documentVerified: true,
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
        street: 'Rua Usuário Um',
        number: '2',
        complement: 'Apto 2',
        neighborhood: 'Jardim',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '02002000',
        documentPhoto: 'default.png',
        documentSelfie: 'default.png',
        documentVerified: true,
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
        street: 'Rua Usuário Dois',
        number: '3',
        complement: 'Apto 3',
        neighborhood: 'Vila',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '03003000',
        documentPhoto: 'default.png',
        documentSelfie: 'default.png',
        documentVerified: true,
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
        street: 'Rua Usuário Três',
        number: '4',
        complement: 'Apto 4',
        neighborhood: 'Bairro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04004000',
        documentPhoto: 'default.png',
        documentSelfie: 'default.png',
        documentVerified: true,
        permission_id: userPermission.id
      }
    })

    console.log('✅ Usuários criados com sucesso!')
    console.log('👤 Super Admin:', superAdminUser.email)
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