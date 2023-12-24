import path from 'path'
import { unlink } from 'node:fs/promises'
import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function get() {
  try {
    const recipes = await prisma.recipeInfo.findMany({ orderBy: { createdAt: 'desc' }, take: 30 })
    await prisma.$disconnect()
    return recipes
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function getNewest() {
  try {
    const recipe = await prisma.recipe.findFirst({ orderBy: { createdAt: 'desc' }, include: { author: true } })
    await prisma.$disconnect()
    return recipe
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function getById(id) {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: id }, include: { author: true } })
    await prisma.$disconnect()
    return recipe
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function upsert(recipe) {
  try {
    let savedRecipe = null
    if (recipe.id) {
      savedRecipe = await prisma.recipe.update({
        data: {
          ...recipe,
        },
      })
    } else {
      savedRecipe = await prisma.recipe.create({
        data: {
          ...recipe,
        },
      })
    }
    await prisma.$disconnect()
    return savedRecipe
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function remove(recipeId, userId) {
  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId, authorId: userId } })
    if (!recipe) {
      return false
    }
    await prisma.recipe.delete({
      where: {
        id: recipe.id,
      },
    })
    const filePath = path.join('./public/images', path.parse(recipe.photoURL).name + path.parse(recipe.photoURL).ext)
    await unlink(filePath)
    await prisma.$disconnect()
    return true
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
    return false
  }
}
