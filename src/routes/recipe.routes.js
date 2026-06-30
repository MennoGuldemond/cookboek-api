import express from 'express'
import bodyParser from 'body-parser'
import * as recipeRepository from '../repositories/recipe.repository.js'
import { isAuthorized } from '../auth.js'

export const recipeRouter = express.Router()
recipeRouter.use(bodyParser.json())

/**
 * @openapi
 * /recipes:
 *   get:
 *     summary: List recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Recipe list
 */
recipeRouter.get('/', async (req, res) => {
  try {
    let recipes = await recipeRepository.get(req.query)
    return res.status(200).json(recipes)
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /recipes/newest:
 *   get:
 *     summary: Get newest recipe
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Newest recipe
 */
recipeRouter.get('/newest', async (req, res) => {
  try {
    let recipe = await recipeRepository.getNewest()
    return res.status(200).json(recipe)
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /recipes/liked:
 *   get:
 *     summary: Get recipes liked by current user
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Liked recipes
 */
recipeRouter.get('/liked', isAuthorized, async (req, res) => {
  try {
    const userId = res.locals.auth.sub
    let recipe = await recipeRepository.getLikedRecipesByUser(userId)
    if (recipe) {
      return res.status(200).json(recipe)
    } else {
      return res.status(404).json({ message: 'No liked recipes found' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /recipes/{id}:
 *   get:
 *     summary: Get recipe by id
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe found
 */
recipeRouter.get('/:id', async (req, res) => {
  try {
    let recipe = await recipeRepository.getById(req.params.id)
    if (recipe) {
      return res.status(200).json(recipe)
    } else {
      return res.status(404).json({ message: 'Recipe not found' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /recipes:
 *   post:
 *     summary: Create or update recipe
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: Saved recipe
 */
recipeRouter.post('/', isAuthorized, async (req, res) => {
  try {
    if (res.locals.auth.sub !== req.body.authorId) {
      return res.status(401).send('UnAuthorized')
    }
    let recipe = await recipeRepository.upsert(req.body, res.locals.auth.sub)
    if (recipe) {
      return res.status(200).json(recipe)
    } else {
      return res.status(404).json({ message: 'Recipe could not be saved' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /recipes/{id}:
 *   delete:
 *     summary: Delete recipe by id
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete result
 */
recipeRouter.delete('/:id', isAuthorized, async (req, res) => {
  try {
    let success = await recipeRepository.remove(req.params.id, res.locals.auth.sub)
    if (success) {
      return res.status(200).send(true)
    } else {
      return res.status(500).send(false)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})
