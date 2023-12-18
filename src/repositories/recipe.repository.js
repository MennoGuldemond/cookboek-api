import { prisma } from '../db/client.js'

export async function getAll() {
  try {
    const users = await prisma.recipe.findMany()
    await prisma.$disconnect()
    return users
  } catch (error) {
    console.error(error)
    await prisma.$disconnect()
  }
}

export async function getById(id) {
  return prisma.recipe
    .findUnique({ where: { id: id } })
    .then(async (recipe) => {
      await prisma.$disconnect()
      return recipe
    })
    .catch(async (error) => {
      console.error(error)
      await prisma.$disconnect()
    })
}
