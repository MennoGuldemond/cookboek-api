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
    logService.error(JSON.stringify(err))
    await prisma.$disconnect()
  }
}

export async function getNewest() {
  try {
    const recipe = await prisma.recipe.findFirst({ orderBy: { createdAt: 'desc' }, include: { author: true } })
    await prisma.$disconnect()
    return recipe
  } catch (err) {
    logService.error(JSON.stringify(err))
    await prisma.$disconnect()
  }
}

export async function getById(id) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: id },
      include: { author: true, categories: true, likes: true },
    })
    await prisma.$disconnect()
    return recipe
  } catch (err) {
    logService.error(JSON.stringify(err))
    await prisma.$disconnect()
  }
}

export async function upsert(recipe, userId) {
  try {
    let savedRecipe = null
    if (recipe.id) {
      const existingRecipe = await prisma.recipe.findUnique({
        where: { id: recipe.id, authorId: userId },
        include: { categories: true },
      })
      if (!existingRecipe) {
        throw new Error(`upsert of recipe: ${recipe.id} by user:${userId} had no result, might be unauthorized.`)
      }

      const toCreate = recipe.categories.filter((rc) => {
        if (!existingRecipe.categories.find((ec) => ec.categoryId === rc.id)) {
          return true
        }
      })
      const createCategories = toCreate.map((c) => {
        return {
          category: {
            connect: {
              id: c.id,
            },
          },
        }
      })

      const toDelete = existingRecipe.categories.filter((ec) => {
        if (!recipe.categories.find((rc) => rc.id === ec.categoryId)) {
          return true
        }
      })
      toDelete.forEach(async (cr) => {
        await prisma.categoriesOnRecipes.delete({
          where: {
            id: cr.id,
          },
        })
      })

      // Only update the values that can be updated
      savedRecipe = await prisma.recipe.update({
        data: {
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          photoURL: recipe.photoURL,
          published: recipe.published,
          categories: {
            create: createCategories,
          },
        },
        where: { id: recipe.id, authorId: userId },
      })
    } else {
      savedRecipe = await prisma.recipe.create({
        data: {
          ...recipe,
          categories: {
            create: recipe.categories.map((c) => {
              return {
                category: {
                  connect: {
                    id: c.id,
                  },
                },
              }
            }),
          },
        },
      })
    }
    await prisma.$disconnect()
    return savedRecipe
  } catch (err) {
    logService.error(JSON.stringify(err))
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
    logService.error(JSON.stringify(err))
    await prisma.$disconnect()
    return false
  }
}
