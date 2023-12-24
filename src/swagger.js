import swaggerJsdoc from 'swagger-jsdoc'
import { serve, setup } from 'swagger-ui-express'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

const options = {
  swaggerDefinition: {
    restapi: '3.0.0',
    info: {
      title: 'Cookboek API',
      version: packageJson.version,
      description: packageJson.description,
      //   termsOfService: "http://example.com/terms/",
      contact: {
        name: 'API Support',
        url: 'http://www.cookboek.nl/support',
        email: 'support@cookboek.nl',
      },
    },
    produces: ['application/json'],
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: ['src/routes/*.ts'],
}

const specs = swaggerJsdoc(options)

export function serveSwagger(app) {
  app.use('/docs', serve, setup(specs))
}
