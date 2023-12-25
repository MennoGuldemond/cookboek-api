import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import { serveSwagger } from './swagger.js'
import { userRouter } from './routes/user.routes.js'
import { recipeRouter } from './routes/recipe.routes.js'
import { imageRouter } from './routes/image.routes.js'
import { categoryRouter } from './routes/category.routes.js'
import { likeRouter } from './routes/like.routes.js'

const port = process.env.PORT || 3000
const app = express()
serveSwagger(app)
dotenv.config()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))
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

// ROUTES
app.use('/users', userRouter)
app.use('/recipes', recipeRouter)
app.use('/categories', categoryRouter)
app.use('/likes', likeRouter)
app.use('/images', imageRouter)
