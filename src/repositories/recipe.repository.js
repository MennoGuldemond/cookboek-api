import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function getAll() {
  try {
    const users = await prisma.recipe.findMany()
    await prisma.$disconnect()
    return users
  } catch (err) {
    logService.error(err)
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
    .catch(async (err) => {
      logService.error(err)
      await prisma.$disconnect()
    })
}
