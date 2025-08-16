import express from 'express'
import bodyParser from 'body-parser'
import * as userService from '../services/user.service.js'
import { isAuthorized } from '../auth.js'

export const userRouter = express.Router()
userRouter.use(bodyParser.json())

userRouter.get('/:email', isAuthorized, async (req, res) => {
  try {
    const user = await userService.getByEmail(req.params.email)
    if (user) {
      return res.status(200).json(user)
    } else {
      return res.status(404)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

userRouter.get('/', isAuthorized, async (req, res) => {
  try {
    const userProfile = res.locals.auth
    const user = await userService.findOrCreate(userProfile)
    const userInfo = await userService.getById(user.id)
    if (userInfo) {
      return res.status(200).json(userInfo)
    } else {
      return res.status(404)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

userRouter.get('/:id', isAuthorized, async (req, res) => {
  try {
    const userInfo = await userService.getById(req.params.id)
    if (userInfo) {
      return res.status(200).json(userInfo)
    } else {
      return res.status(404)
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})
