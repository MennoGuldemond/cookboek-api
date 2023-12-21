import express from 'express'
import bodyParser from 'body-parser'
import * as userService from '../services/user.service.js'
import { isAuthorized } from '../auth.js'

export const userRouter = express.Router()
userRouter.use(bodyParser.json())

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: the list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/prisma/'
 */
userRouter.get('/', isAuthorized, async (req, res) => {
  try {
    let users = await userService.getAll()
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json(error)
  }
})

userRouter.get('/:email', isAuthorized, async (req, res) => {
  try {
    let user = await userService.getByEmail(req.params.email)
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})
