import express from 'express'
import bodyParser from 'body-parser'
import * as recipeRepository from '../repositories/recipe.repository.js'
import { isAuthorized } from '../auth.js'

export const recipeRouter = express.Router()
recipeRouter.use(bodyParser.json())

recipeRouter.get('/', async (req, res) => {
  try {
    let recipes = await recipeRepository.get(req.query)
    return res.status(200).json(recipes)
  } catch (error) {
    return res.status(500).json(error)
  }
})

recipeRouter.get('/newest', async (req, res) => {
  try {
    let recipe = await recipeRepository.getNewest()
    return res.status(200).json(recipe)
  } catch (error) {
    return res.status(500).json(error)
  }
})

recipeRouter.get('/liked', isAuthorized, async (req, res) => {
  try {
    console.log('Fetching liked recipes for user:', res.locals.auth.sub)
    const userId = res.locals.auth.sub
    let recipe = await recipeRepository.getLikedRecipesByUser(userId)
    if (recipe) {
      return res.status(200).json(recipe)
    } else {
      return res.status(404)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

recipeRouter.get('/:id', async (req, res) => {
  try {
    let recipe = await recipeRepository.getById(req.params.id)
    if (recipe) {
      return res.status(200).json(recipe)
    } else {
      return res.status(404)
    }
  } catch (error) {
    return res.status(500).json(error)
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
    return res.status(500).json(error)
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
    return res.status(500).json(error)
  }
})
