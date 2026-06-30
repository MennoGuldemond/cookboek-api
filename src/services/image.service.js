import path from 'path'
import fs from 'fs'
import { unlink } from 'node:fs/promises'
import { BlobServiceClient } from '@azure/storage-blob'

const azureConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const azureContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'images'

export function isUsingAzureBlobStorage() {
  return process.env.NODE_ENV === 'production' || process.env.IMAGE_STORAGE_PROVIDER === 'azure'
}

export function sanitizeFilename(filename) {
  return filename.replace(/\s+/g, '')
}

export function ensureLocalImageDirectory() {
  fs.mkdirSync('./public/images', { recursive: true })
}

export function buildTimestampedFilename(filename) {
  const cleanName = sanitizeFilename(filename)
  return `${path.parse(cleanName).name}-${Date.now()}${path.extname(cleanName)}`
}

export function buildLocalImageUrl(req, filename) {
  const imageUrl = req.protocol + '://' + req.get('host') + '/public/images/'
  return imageUrl + sanitizeFilename(filename)
}

export async function uploadToAzureBlob(file) {
  if (!azureConnectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured')
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionString)
  const containerClient = blobServiceClient.getContainerClient(azureContainerName)
  await containerClient.createIfNotExists({ access: 'blob' })

  const blobName = buildTimestampedFilename(file.originalname)
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  })

  return blockBlobClient.url
}

function isAzureBlobUrl(photoURL) {
  return typeof photoURL === 'string' && photoURL.includes('.blob.core.')
}

function getLocalImagePath(photoURL) {
  if (!photoURL) {
    return null
  }

  if (photoURL.startsWith('http://') || photoURL.startsWith('https://')) {
    const parsedUrl = new URL(photoURL)
    return path.join('./public/images', path.basename(parsedUrl.pathname))
  }

  return path.join('./public/images', path.basename(photoURL))
}

async function deleteAzureBlob(photoURL) {
  if (!azureConnectionString) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured')
  }

  const parsed = new URL(photoURL)
  const pathParts = parsed.pathname.split('/').filter(Boolean)
  if (pathParts.length < 2) {
    throw new Error(`Invalid blob URL path: ${photoURL}`)
  }

  const containerName = pathParts[0]
  const blobName = pathParts.slice(1).join('/')

  const blobServiceClient = BlobServiceClient.fromConnectionString(azureConnectionString)
  const blobClient = blobServiceClient.getContainerClient(containerName).getBlockBlobClient(blobName)
  await blobClient.deleteIfExists()
}

async function deleteLocalImage(photoURL) {
  const filePath = getLocalImagePath(photoURL)
  if (!filePath) {
    return
  }

  try {
    await unlink(filePath)
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }
}

export async function deleteByUrl(photoURL) {
  if (!photoURL) {
    return
  }

  if (isAzureBlobUrl(photoURL)) {
    await deleteAzureBlob(photoURL)
    return
  }

  await deleteLocalImage(photoURL)
}
