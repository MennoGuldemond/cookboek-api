import express from 'express'
import bodyParser from 'body-parser'
import * as categoryRepository from '../repositories/category.repository.js'
import { isAuthorized, isAdmin } from '../auth.js'

export const categoryRouter = express.Router()
categoryRouter.use(bodyParser.json())

/**
 * @openapi
 * /categories:
 *   get:
 *     summary: List categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Category list
 */
categoryRouter.get('/', async (req, res) => {
  try {
    let categories = await categoryRepository.get()
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).json(error)
  }
})

/**
 * @openapi
 * /categories/{id}:
 *   get:
 *     summary: Get category by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 */
categoryRouter.get('/:id', async (req, res) => {
  try {
    let category = await categoryRepository.getById(req.params.id)
    if (category) {
      return res.status(200).json(category)
    } else {
      return res.status(404).json({ message: 'Category not found' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /categories:
 *   post:
 *     summary: Create or update category
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Saved category
 */
categoryRouter.post('/', isAuthorized, isAdmin, async (req, res) => {
  try {
    let category = await categoryRepository.upsert(req.body)
    if (category) {
      return res.status(200).json(category)
    } else {
      return res.status(404).json({ message: 'Category could not be saved' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /categories/{id}:
 *   delete:
 *     summary: Delete category by id
 *     tags: [Categories]
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
categoryRouter.delete('/:id', isAuthorized, isAdmin, async (req, res) => {
  try {
    let success = await categoryRepository.remove(req.params.id)
    if (success) {
      return res.status(200).send(true)
    } else {
      return res.status(500).send(false)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})
