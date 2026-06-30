import { OAuth2Client } from 'google-auth-library'
import * as userService from './services/user.service.js'
const authClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function isAuthorized(req, res, next) {
  async function verify() {
    if (!req.headers.authorization) {
      return res.status(401).send('Unauthorized')
    }
    const ticket = await authClient.verifyIdToken({
      idToken: req.headers.authorization,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload) {
      return res.status(401).send('Unauthorized')
    }
    res.locals.auth = payload
    return next()
  }
  verify().catch((error) => {
    console.error('Authorization verification failed:', error)
    if (!res.headersSent) {
      return res.status(401).send('Unauthorized')
    }
    return null
  })
}

export async function isAdmin(req, res, next) {
  async function verify() {
    if (!req.headers.authorization) {
      return res.status(401).send('Unauthorized')
    }
    const ticket = await authClient.verifyIdToken({
      idToken: req.headers.authorization,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload) {
      return res.status(401).send('Unauthorized')
    }

    const userId = payload.sub
    const user = await userService.getById(userId)
    if (user?.role === 'ADMIN') {
      return next()
    } else {
      return res.status(403).send('Forbidden')
    }
  }
  verify().catch((error) => {
    console.error('Admin verification failed:', error)
    if (!res.headersSent) {
      return res.status(401).send('Unauthorized')
    }
    return null
  })
}
