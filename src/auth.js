import { OAuth2Client } from 'google-auth-library'
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
    if (!ticket.getPayload) {
      return res.status(401).send('Unauthorized')
    }
    const payload = ticket.getPayload()
    res.locals.auth = payload
    next()
  }
  verify().catch(console.error)
}
