import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import { isAuthorized } from '../auth.js'
import * as imageService from '../services/image.service.js'

export const imageRouter = express.Router()
imageRouter.use(bodyParser.json())

const useAzureBlobStorage = imageService.isUsingAzureBlobStorage()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    imageService.ensureLocalImageDirectory()
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, imageService.buildTimestampedFilename(file.originalname))
  },
})

const upload = multer({
  storage: useAzureBlobStorage ? multer.memoryStorage() : storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

/**
 * @openapi
 * /images/upload:
 *   post:
 *     summary: Upload an image
 *     tags: [Images]
 *     responses:
 *       200:
 *         description: Uploaded image URL
 */
imageRouter.post('/upload', isAuthorized, upload.single('file'), async function (req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  try {
    if (useAzureBlobStorage) {
      const photoURL = await imageService.uploadToAzureBlob(req.file)
      return res.status(200).json({ photoURL })
    }

    return res.status(200).json({
      photoURL: imageService.buildLocalImageUrl(req, req.file.filename),
    })
  } catch (error) {
    console.error('Image upload failed:', error)
    return res.status(500).json({ message: 'Image upload failed' })
  }
})
