import express from 'express'
import bodyParser from 'body-parser'
import * as recipeRepository from '../repositories/recipe.repository.js'
import { isAuthorized } from '../auth.js'

export const recipeRouter = express.Router()
recipeRouter.use(bodyParser.json())

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Returns all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: the list of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/prisma/'
 */
recipeRouter.get('/', async (req, res) => {
  try {
    let recipes = await recipeRepository.get()
    res.status(200).json(recipes)
  } catch (error) {
    res.status(500).json(error)
  }
})

recipeRouter.get('/newest', async (req, res) => {
  try {
    let recipe = await recipeRepository.getNewest()
    res.status(200).json(recipe)
  } catch (error) {
    res.status(500).json(error)
  }
})

recipeRouter.get('/:id', async (req, res) => {
  try {
    let recipe = await recipeRepository.getById(req.params.id)
    if (recipe) {
      res.status(200).json(recipe)
    } else {
      res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

recipeRouter.post('/', isAuthorized, async (req, res) => {
  try {
    if (res.locals.auth.sub !== req.body.authorId) {
      return res.status(401).send('UnAuthorized')
    }
    let recipe = await recipeRepository.upsert(req.body, res.locals.auth.sub)
    if (recipe) {
      return res.status(200).json(recipe)
    } else {
      return res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

recipeRouter.delete('/:id', isAuthorized, async (req, res) => {
  try {
    let success = await recipeRepository.remove(req.params.id, res.locals.auth.sub)
    if (success) {
      return res.status(200).send(true)
    } else {
      return res.status(500).send(false)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})
