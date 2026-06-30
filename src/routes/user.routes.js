import express from 'express'
import bodyParser from 'body-parser'
import * as userService from '../services/user.service.js'
import { isAuthorized } from '../auth.js'

export const userRouter = express.Router()
userRouter.use(bodyParser.json())

/**
 * @openapi
 * /users/{email}:
 *   get:
 *     summary: Get user by email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 */
userRouter.get('/:email', isAuthorized, async (req, res) => {
  try {
    const user = await userService.getByEmail(req.params.email)
    if (user) {
      return res.status(200).json(user)
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get current user information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Current user data
 */
userRouter.get('/', isAuthorized, async (req, res) => {
  try {
    const userProfile = res.locals.auth
    const user = await userService.findOrCreate(userProfile)
    if (!user?.id) {
      return res.status(500).json({ message: 'Failed to create or load user' })
    }

    const userInfo = await userService.getById(user.id)
    if (userInfo) {
      return res.status(200).json(userInfo)
    } else {
      // Fallback when UserInfo view is unavailable/outdated in an environment.
      return res.status(200).json(user)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 */
userRouter.get('/:id', isAuthorized, async (req, res) => {
  try {
    const userInfo = await userService.getById(req.params.id)
    if (userInfo) {
      return res.status(200).json(userInfo)
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})
