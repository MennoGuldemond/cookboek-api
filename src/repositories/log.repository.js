import { prisma } from '../db/client.js'

export async function get(params) {
  try {
    // Default pagination settings if query params are not provided
    const skip = params?.skip ? +params.skip : 0
    const take = params?.take ? +params.take : 30

    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      take: take,
      skip: skip,
    })
    await prisma.$disconnect()
    return logs
  } catch (err) {
    console.error(err)
    return await prisma.$disconnect()
  }
}

export async function create(message, level) {
  try {
    const log = await prisma.log.create({
      data: {
        message,
        level,
      },
    })
    await prisma.$disconnect()
    return log
  } catch (err) {
    console.error(err)
    return await prisma.$disconnect()
  }
}
