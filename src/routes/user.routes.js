import express from 'express'
import bodyParser from 'body-parser'
import * as userService from '../services/user.service.js'
import { isAuthorized } from '../auth.js'

export const userRouter = express.Router()
userRouter.use(bodyParser.json())

// userRouter.get('/', isAuthorized, async (req, res) => {
//   try {
//     const users = await userService.getAll()
//     res.status(200).json(users)
//   } catch (error) {
//     res.status(500).json(error)
//   }
// })

userRouter.get('/:email', isAuthorized, async (req, res) => {
  try {
    const user = await userService.getByEmail(req.params.email)
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})

userRouter.get('/', isAuthorized, async (req, res) => {
  try {
    const userProfile = res.locals.auth
    const user = await userService.findOrCreate(userProfile)
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404)
    }
  } catch (error) {
    res.status(500).json(error)
  }
})
