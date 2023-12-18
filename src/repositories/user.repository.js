import { prisma } from '../db/client.js'

export async function getAll() {
  try {
    const users = await prisma.user.findMany()
    await prisma.$disconnect()
    return users
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
  }
}

export async function getById(id) {
  return prisma.user
    .findUnique({ where: { id: id } })
    .then(async (user) => {
      await prisma.$disconnect()
      return user
    })
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
    })
}
