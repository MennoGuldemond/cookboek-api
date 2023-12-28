import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import https from 'https'
import * as url from 'url'
import { serveSwagger } from './swagger.js'
import { userRouter } from './routes/user.routes.js'
import { recipeRouter } from './routes/recipe.routes.js'
import { imageRouter } from './routes/image.routes.js'
import { categoryRouter } from './routes/category.routes.js'
import { likeRouter } from './routes/like.routes.js'

const __dirname = url.fileURLToPath(new URL('../', import.meta.url))

const credentials = {
  key: fs.readFileSync(path.join('/etc/letsencrypt/live/cookboek.hopto.org', 'privkey.pem'), 'utf8'),
  cert: fs.readFileSync(path.join('/etc/letsencrypt/live/cookboek.hopto.org', 'cert.pem'), 'utf8'),
}

const port = process.env.PORT || 3000
const app = express()
app.use('/public', express.static(path.join(__dirname, 'public')))
serveSwagger(app)
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET',
  })
)

https
  .createServer(
    {
      key: credentials.key,
      cert: credentials.cert,
    },
    app
  )
  .listen(port, () => {
    console.log(`App running on ${port}`)
  })

// app.listen(port, () => {
//   console.log(`App running on ${port}`)
// })

app.get('/', (req, res) => {
  res.sendFile('./public/dist/index.html', { root: __dirname })
})

// ROUTES
app.use('/users', userRouter)
app.use('/recipes', recipeRouter)
app.use('/categories', categoryRouter)
app.use('/likes', likeRouter)
app.use('/images', imageRouter)
