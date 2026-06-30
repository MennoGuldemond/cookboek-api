import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import path from 'path'
import fs from 'fs'
import { BlobServiceClient } from '@azure/storage-blob'
import { isAuthorized } from '../auth.js'

export const imageRouter = express.Router()
imageRouter.use(bodyParser.json())

const azureConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const azureContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'images'
const useAzureBlobStorage = process.env.NODE_ENV === 'production' || process.env.IMAGE_STORAGE_PROVIDER === 'azure'

function sanitizeFilename(filename) {
  return filename.replace(/\s+/g, '')
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync('./public/images', { recursive: true })
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    // Remove spaces from the original filename
    file.originalname = sanitizeFilename(file.originalname)
    cb(null, path.parse(file.originalname).name + '-' + Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: useAzureBlobStorage ? multer.memoryStorage() : storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})

async function uploadToAzureBlob(file) {
  if (!azureConnectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured')
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionString)
  const containerClient = blobServiceClient.getContainerClient(azureContainerName)
  await containerClient.createIfNotExists({ access: 'blob' })

  const cleanOriginalName = sanitizeFilename(file.originalname)
  const blobName = `${path.parse(cleanOriginalName).name}-${Date.now()}${path.extname(cleanOriginalName)}`
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  })

  return blockBlobClient.url
}

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
      const photoURL = await uploadToAzureBlob(req.file)
      return res.status(200).json({ photoURL })
    }

    // req.file is the `profile-file` file
    //   console.log(req.file)
    let imageUrl = req.protocol + '://' + req.get('host') + '/public/images/'
    return res.status(200).json({
      photoURL: imageUrl + req.file.filename.replace(/\s+/g, ''),
    })
  } catch (error) {
    console.error('Image upload failed:', error)
    return res.status(500).json({ message: 'Image upload failed' })
  }
})
