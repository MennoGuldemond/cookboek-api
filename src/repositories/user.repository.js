import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

const userSelect = {
  id: true,
  email: true,
  name: true,
  photoUrl: true,
  provider: true,
  createdAt: true,
}

function toErrorMessage(error) {
  if (!error) {
    return 'Unknown error'
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }

  return JSON.stringify(error)
}

export async function getAll() {
  try {
    const users = await prisma.user.findMany({ select: userSelect })
    return users
  } catch (err) {
    await logService.error(`getAll users failed: ${toErrorMessage(err)}`)
    return null
  }
}

export async function getById(id) {
  try {
    const userInfo = await prisma.userInfo.findUnique({
      where: { id: id },
    })
    return userInfo
  } catch (err) {
    await logService.error(`getById user failed: ${toErrorMessage(err)}`)
    return null
  }
}

export async function getByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: userSelect,
    })
    return user
  } catch (err) {
    await logService.error(`getByEmail user failed: ${toErrorMessage(err)}`)
    return null
  }
}

export async function findOrCreate(userProfile) {
  try {
    if (!userProfile?.sub || !userProfile?.email) {
      throw new Error('Missing required Google profile fields: sub/email')
    }

    const user = await prisma.user.upsert({
      where: { id: userProfile.sub },
      update: {
        email: userProfile.email,
        name: userProfile.name,
        photoUrl: userProfile.picture,
        provider: 'Google',
      },
      create: {
        id: userProfile.sub,
        email: userProfile.email,
        name: userProfile.name,
        photoUrl: userProfile.picture,
        provider: 'Google',
      },
      select: userSelect,
    })

    return user
  } catch (err) {
    await logService.error(`findOrCreate user failed: ${toErrorMessage(err)}`)
    return null
  }
}

export async function create(userProfile) {
  try {
    const newUser = await prisma.user.create({
      data: {
        id: userProfile.sub,
        email: userProfile.email,
        name: userProfile.name,
        photoUrl: userProfile.picture,
        provider: 'Google',
      },
      select: userSelect,
    })
    return newUser
  } catch (err) {
    await logService.error(`create user failed: ${toErrorMessage(err)}`)
    return null
  }
}
