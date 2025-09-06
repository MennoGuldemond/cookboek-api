import express from 'express'
import bodyParser from 'body-parser'
import * as logRepository from '../repositories/log.repository.js'
import { isAdmin, isAuthorized } from '../auth.js'

export const logRouter = express.Router()
logRouter.use(bodyParser.json())

logRouter.get('/', isAuthorized, isAdmin, async (req, res) => {
  try {
    let logs = await logRepository.get()
    res.status(200).json(logs)
  } catch (error) {
    res.status(500).json(error)
  }
})
