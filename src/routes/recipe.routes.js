import express from 'express'
import bodyParser from 'body-parser'
import * as recipeRepository from '../repositories/recipe.repository.js'

export const recipeRouter = express.Router()
recipeRouter.use(bodyParser.json()) // to use body object in requests

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
    let recipes = await recipeRepository.getAll()
    res.status(200).json(recipes)
  } catch (error) {
    res.status(400).json(error)
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
    res.status(400).json(error)
  }
})
