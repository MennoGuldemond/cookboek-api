import { prisma } from '../db/client.js'

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
