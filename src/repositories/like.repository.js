import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function getByUserId(userId) {
  try {
    const likes = await prisma.likes.findMany({ where: { userId: userId } })
    await prisma.$disconnect()
    return likes
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function getByRecipeId(recipeId) {
  try {
    const likes = await prisma.likes.findMany({ where: { recipeId: recipeId } })
    await prisma.$disconnect()
    return likes
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function getById(id) {
  try {
    const like = await prisma.likes.findUnique({ where: { id: id } })
    await prisma.$disconnect()
    return like
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function create(like) {
  try {
    const saved = await prisma.likes.create({
      data: {
        ...like,
      },
    })
    return saved
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function remove(likeId) {
  try {
    await prisma.likes.delete({
      where: {
        id: likeId,
      },
    })
    await prisma.$disconnect()
    return true
  } catch (err) {
    logService.error(JSON.stringify(err))
    await prisma.$disconnect()
    return false
  }
}
