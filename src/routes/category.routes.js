import express from 'express'
import bodyParser from 'body-parser'
import * as categoryRepository from '../repositories/category.repository.js'
import { isAuthorized } from '../auth.js'

export const categoryRouter = express.Router()
categoryRouter.use(bodyParser.json())

categoryRouter.get('/', async (req, res) => {
  try {
    let categories = await categoryRepository.get()
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json(error)
  }
})

categoryRouter.get('/:id', async (req, res) => {
  try {
    let category = await categoryRepository.getById(req.params.id)
    if (category) {
      res.status(200).json(category)
    } else {
      res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

categoryRouter.post('/', isAuthorized, async (req, res) => {
  try {
    let category = await categoryRepository.upsert(req.body)
    if (category) {
      return res.status(200).json(category)
    } else {
      return res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

categoryRouter.delete('/:id', isAuthorized, async (req, res) => {
  try {
    let success = await categoryRepository.remove(req.params.id)
    if (success) {
      return res.status(200).send(true)
    } else {
      return res.status(500).send(false)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})
