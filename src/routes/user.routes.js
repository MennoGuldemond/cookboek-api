import express from 'express'
import bodyParser from 'body-parser'
import * as userRepository from '../repositories/user.repository.js'

export const userRouter = express.Router()
userRouter.use(bodyParser.json()) // to use body object in requests

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
userRouter.get('/', async (req, res) => {
  console.log('users')
  try {
    let users = await userRepository.getAll()
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json(error)
  }
})

userRouter.get('/:id', async (req, res) => {
  try {
    let user = await userRepository.getById(+req.params.id)
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404)
    }
  } catch (error) {
    res.status(400).json(error)
  }
})
