import express from 'express'
import bodyParser from 'body-parser'
import * as likeRepository from '../repositories/like.repository.js'
import { isAuthorized } from '../auth.js'

export const likeRouter = express.Router()
likeRouter.use(bodyParser.json())

likeRouter.get('/recipe/:recipeId', async (req, res) => {
  try {
    let likes = await likeRepository.getByRecipeId(req.params.recipeId)
    res.status(200).json(likes)
  } catch (error) {
    res.status(500).json(error)
  }
})

likeRouter.get('/user/:userId', isAuthorized, async (req, res) => {
  try {
    let likes = await likeRepository.getByUserId(req.params.userId)
    res.status(200).json(likes)
  } catch (error) {
    res.status(500).json(error)
  }
})

likeRouter.get('/:id', isAuthorized, async (req, res) => {
  try {
    let like = await likeRepository.getById(req.params.id)
    if (like) {
      res.status(200).json(like)
    } else {
      res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

likeRouter.post('/', isAuthorized, async (req, res) => {
  try {
    let like = await likeRepository.create(req.body)
    if (like) {
      return res.status(200).json(like)
    } else {
      return res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

likeRouter.delete('/:id', isAuthorized, async (req, res) => {
  try {
    let success = await likeRepository.remove(req.params.id)
    if (success) {
      return res.status(200).send(true)
    } else {
      return res.status(500).send(false)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})
