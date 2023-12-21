import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function getAll() {
  try {
    const users = await prisma.user.findMany()
    await prisma.$disconnect()
    return users
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function getById(id) {
  return prisma.user
    .findUnique({ where: { id: id } })
    .then(async (user) => {
      await prisma.$disconnect()
      return user
    })
    .catch(async (err) => {
      logService.error(err)
      await prisma.$disconnect()
    })
}

export async function getByEmail(email) {
  return prisma.user
    .findUnique({ where: { email: email } })
    .then(async (user) => {
      await prisma.$disconnect()
      return user
    })
    .catch(async (err) => {
      logService.error(err)
      await prisma.$disconnect()
    })
}

export async function findOrCreate(user) {
  const found = await getByEmail(user.email)
  if (found) {
    return found
  }
  return await create(user)
}

export async function create(user) {
  try {
    const newUser = prisma.user.create({
      data: {
        email: user.email,
        name: user.displayName,
        photoUrl: user.picture,
        provider: user.provider,
      },
    })
    await prisma.$disconnect()
    return newUser
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}
