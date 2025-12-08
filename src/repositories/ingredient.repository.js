import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function get() {
  try {
    const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } })
    await prisma.$disconnect()
    return ingredients
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function getById(id) {
  try {
    const ingredient = await prisma.ingredient.findUnique({ where: { id: id } })
    await prisma.$disconnect()
    return ingredient
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function createOrGet(ingredient) {
  try {
    let existingIngredient = null
    existingIngredient = await prisma.ingredient.findUnique({ where: { name: ingredient.name } })
    if (!existingIngredient) {
      existingIngredient = await prisma.ingredient.create({
        data: {
          ...ingredient,
        },
      })
    }
    await prisma.$disconnect()
    return existingIngredient
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function saveToRecipe(ingredients, recipeId) {
  try {
    for (const ingredient of ingredients) {
      await prisma.recipeIngredient.create({
        data: {
          ingredientId: ingredient.id,
          recipeId: recipeId,
        },
      })
    }
    await prisma.$disconnect()
    return true
  } catch (err) {
    logService.error(JSON.stringify(err))
    await prisma.$disconnect()
    return false
  }
}

export async function remove(ingredientId) {
  try {
    await prisma.ingredient.delete({
      where: {
        id: ingredientId,
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
