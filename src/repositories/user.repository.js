import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function getAll() {
  try {
    const users = await prisma.user.findMany()
    return users
  } catch (err) {
    await logService.error(JSON.stringify(err))
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
    await logService.error(JSON.stringify(err))
    return null
  }
}

export async function getByEmail(email) {
  try {
    const user = await prisma.user.findUnique({ where: { email: email } })
    return user
  } catch (err) {
    await logService.error(JSON.stringify(err))
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
    })

    return user
  } catch (err) {
    await logService.error(`findOrCreate user failed: ${JSON.stringify(err)}`)
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
    })
    return newUser
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
  }
}
