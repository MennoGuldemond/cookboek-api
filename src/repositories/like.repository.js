import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function getByUserId(userId) {
  try {
    const likes = await prisma.likes.findMany({ where: { userId: userId } })
    return likes
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
  }
}

export async function getByRecipeId(recipeId) {
  try {
    const likes = await prisma.likes.findMany({ where: { recipeId: recipeId } })
    return likes
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
  }
}

export async function getById(id) {
  try {
    const like = await prisma.likes.findUnique({ where: { id: id } })
    return like
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
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
    await logService.error(JSON.stringify(err))
    return null
  }
}

export async function remove(likeId) {
  try {
    await prisma.likes.delete({
      where: {
        id: likeId,
      },
    })
    return true
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return false
  }
}
