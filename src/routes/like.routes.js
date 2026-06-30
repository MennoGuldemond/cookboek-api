import express from 'express'
import bodyParser from 'body-parser'
import * as likeRepository from '../repositories/like.repository.js'
import { isAuthorized } from '../auth.js'

export const likeRouter = express.Router()
likeRouter.use(bodyParser.json())

/**
 * @openapi
 * /likes/recipe/{recipeId}:
 *   get:
 *     summary: List likes for a recipe
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes list
 */
likeRouter.get('/recipe/:recipeId', async (req, res) => {
  try {
    let likes = await likeRepository.getByRecipeId(req.params.recipeId)
    return res.status(200).json(likes)
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /likes/user/{userId}:
 *   get:
 *     summary: List likes for a user
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes list
 */
likeRouter.get('/user/:userId', isAuthorized, async (req, res) => {
  try {
    let likes = await likeRepository.getByUserId(req.params.userId)
    return res.status(200).json(likes)
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /likes/{id}:
 *   get:
 *     summary: Get like by id
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like found
 */
likeRouter.get('/:id', isAuthorized, async (req, res) => {
  try {
    let like = await likeRepository.getById(req.params.id)
    if (like) {
      return res.status(200).json(like)
    } else {
      return res.status(404).json({ message: 'Like not found' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /likes:
 *   post:
 *     summary: Create like
 *     tags: [Likes]
 *     responses:
 *       200:
 *         description: Created like
 */
likeRouter.post('/', isAuthorized, async (req, res) => {
  try {
    let like = await likeRepository.create(req.body)
    if (like) {
      return res.status(200).json(like)
    } else {
      return res.status(404).json({ message: 'Like could not be created' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /likes/{id}:
 *   delete:
 *     summary: Delete like by id
 *     tags: [Likes]
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
likeRouter.delete('/:id', isAuthorized, async (req, res) => {
  try {
    let success = await likeRepository.remove(req.params.id)
    if (success) {
      return res.status(200).send(true)
    } else {
      return res.status(500).send(false)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})
