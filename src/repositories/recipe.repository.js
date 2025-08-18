import path from 'path'
import { unlink } from 'node:fs/promises'
import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

/**
 * Get recipes from the RecipeInfo view with optional filters and pagination
 * @param {Object} params - Query parameters (skip, take, authorId, name)
 * @returns {Promise<Array>} - Array of RecipeInfo objects
 */
export async function get(params) {
  try {
    // Default pagination settings if query params are not provided
    // TODO: set max vales
    const skip = params?.skip ? +params.skip : 0
    const take = params?.take ? +params.take : 30
    // const categoryIds = params.categoryIds || []
    const authorId = params.authorId
    const name = params.name

    const recipes = await prisma.recipeInfo.findMany({
      orderBy: { createdAt: 'desc' },
      where: {
        title: {
          contains: name,
        },
        AND: {
          authorId: authorId,
        },
      },
      take: take,
      skip: skip,
    })
    await prisma.$disconnect()
    return recipes
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

/**
 * Get the newest recipe from the RecipeInfo view
 * @returns {Promise<Object|null>} - The newest RecipeInfo object or null
 */
export async function getNewest() {
  try {
    const recipe = await prisma.recipeInfo.findFirst({ orderBy: { createdAt: 'desc' } })
    await prisma.$disconnect()
    return recipe
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

/**
 * Get a recipe by its ID, including author, categories, and likes
 * @param {string} id - The ID of the recipe
 * @returns {Promise<Object|null>} - The recipe object or null
 */
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

/**
 * Get all RecipeInfo view rows for recipes liked by a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of RecipeInfo objects
 */
export async function getLikedRecipesByUser(userId) {
  try {
    const likedRecipeIds = await prisma.likes.findMany({
      where: { userId },
      select: { recipeId: true },
    })
    const recipeIds = likedRecipeIds.map((like) => like.recipeId)
    if (recipeIds.length === 0) {
      await prisma.$disconnect()
      return []
    }
    const recipes = await prisma.recipeInfo.findMany({
      where: {
        id: { in: recipeIds },
      },
    })
    await prisma.$disconnect()
    return recipes
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

/**
 * Create or update a recipe, including category relations
 * @param {Object} recipe - The recipe data
 * @param {string} userId - The ID of the author
 * @returns {Promise<Object>} - The saved recipe object
 */
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
          photoURL: recipe.photoURL.replace(/\s+/g, ''),
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
          photoURL: recipe.photoURL.replace(/\s+/g, ''),
          categories: {
            create: recipe.categories?.map((c) => {
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
    return await prisma.$disconnect()
  }
}

/**
 * Remove a recipe by ID and author, and delete its image file
 * @param {string} recipeId - The ID of the recipe
 * @param {string} userId - The ID of the author
 * @returns {Promise<boolean>} - True if removed, false otherwise
 */
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
