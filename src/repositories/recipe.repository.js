import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'
import * as imageService from '../services/image.service.js'

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
    return recipes
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
  }
}

/**
 * Get the newest recipe from the RecipeInfo view
 * @returns {Promise<Object|null>} - The newest RecipeInfo object or null
 */
export async function getNewest() {
  try {
    const recipe = await prisma.recipeInfo.findFirst({ orderBy: { createdAt: 'desc' } })
    return recipe
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
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
    return recipe
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
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
      return []
    }
    const recipes = await prisma.recipeInfo.findMany({
      where: {
        id: { in: recipeIds },
      },
    })
    return recipes
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
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
    return savedRecipe
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
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
    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId, authorId: userId },
      select: { id: true, photoURL: true },
    })

    if (!recipe) {
      return false
    }

    // Remove relation rows first to satisfy FK constraints, then delete the recipe.
    await prisma.$transaction([
      prisma.likes.deleteMany({ where: { recipeId: recipe.id } }),
      prisma.categoriesOnRecipes.deleteMany({ where: { recipeId: recipe.id } }),
      prisma.recipe.delete({ where: { id: recipe.id } }),
    ])

    // Deleting the recipe should not fail if image cleanup has issues.
    try {
      await imageService.deleteByUrl(recipe.photoURL)
    } catch (imageDeleteError) {
      await logService.warning(
        `Image cleanup failed for recipe ${recipe.id}: ${imageDeleteError?.message || imageDeleteError}`
      )
    }

    return true
  } catch (err) {
    await logService.error(`remove recipe failed: ${err?.message || err}`)
    return false
  }
}
