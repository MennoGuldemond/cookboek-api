import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import { serveSwagger } from './swagger.js'
import { userRouter } from './routes/user.routes.js'
import { OAuth2Strategy } from 'passport-google-oauth'

const port = process.env.PORT || 3000
const app = express()
serveSwagger(app)
dotenv.config()

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET',
  })
)

app.listen(port, () => {
  console.log(`App running on ${port}`)
})

app.use('/users', userRouter)

passport.serializeUser(function (user, cb) {
  cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
  cb(null, obj)
})

passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile)
      const userProfile = profile
      return done(null, userProfile)
    }
  )
)

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), function (req, res) {
  // Successful authentication, redirect success.
  res.redirect('/success')
})
