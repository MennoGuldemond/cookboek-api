import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function getAll() {
  try {
    const users = await prisma.user.findMany()
    await prisma.$disconnect()
    return users
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function getById(id) {
  try {
    const userInfo = await prisma.userInfo.findUnique({
      where: { id: id },
    })
    await prisma.$disconnect()
    return userInfo
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}

export async function getByEmail(email) {
  return prisma.user
    .findUnique({ where: { email: email } })
    .then(async (user) => {
      await prisma.$disconnect()
      return user
    })
    .catch(async (err) => {
      logService.error(JSON.stringify(err))
      return await prisma.$disconnect()
    })
}

export async function findOrCreate(userProfile) {
  const found = await getByEmail(userProfile.email)
  if (found) {
    return found
  }
  return await create(userProfile)
}

export async function create(userProfile) {
  try {
    const newUser = prisma.user.create({
      data: {
        id: userProfile.sub,
        email: userProfile.email,
        name: userProfile.name,
        photoUrl: userProfile.picture,
        provider: 'Google',
      },
    })
    await prisma.$disconnect()
    return newUser
  } catch (err) {
    logService.error(JSON.stringify(err))
    return await prisma.$disconnect()
  }
}
