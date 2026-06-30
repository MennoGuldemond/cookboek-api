import { OAuth2Client } from 'google-auth-library'
import * as userService from './services/user.service.js'
const authClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function readIdToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null
  }

  const normalizedHeader = authorizationHeader.trim()

  // Accept both raw token and "Bearer <token>" formats (case-insensitive).
  const bearerPrefix = /^bearer\s+/i
  if (bearerPrefix.test(normalizedHeader)) {
    return normalizedHeader.replace(bearerPrefix, '').trim()
  }

  return normalizedHeader
}

export async function isAuthorized(req, res, next) {
  try {
    const idToken = readIdToken(req.headers.authorization)
    if (!idToken) {
      return res.status(401).send('Unauthorized')
    }

    const ticket = await authClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload) {
      return res.status(401).send('Unauthorized')
    }

    res.locals.auth = payload
    return next()
  } catch (error) {
    console.error('Authorization verification failed:', error)
    if (!res.headersSent) {
      return res.status(401).send('Unauthorized')
    }
    return null
  }
}

export async function isAdmin(req, res, next) {
  try {
    const idToken = readIdToken(req.headers.authorization)
    if (!idToken) {
      return res.status(401).send('Unauthorized')
    }

    const ticket = await authClient.verifyIdToken({
      idToken,
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
  } catch (error) {
    console.error('Admin verification failed:', error)
    if (!res.headersSent) {
      return res.status(401).send('Unauthorized')
    }
    return null
  }
}
