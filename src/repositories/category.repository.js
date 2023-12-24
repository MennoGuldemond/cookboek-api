import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function get() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    await prisma.$disconnect()
    return categories
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function getById(id) {
  try {
    const category = await prisma.category.findUnique({ where: { id: id } })
    await prisma.$disconnect()
    return category
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function upsert(category) {
  try {
    let existingCategory = null
    if (category.id) {
      const existingCategory = await prisma.category.findUnique({ where: { id: category.id } })
      if (!existingCategory) {
        throw new Error(`upsert of category: ${category.id} had no result.`)
      }
      existingCategory = await prisma.category.update({
        data: {
          ...category,
        },
      })
    } else {
      existingCategory = await prisma.category.create({
        data: {
          ...category,
        },
      })
    }
    await prisma.$disconnect()
    return existingCategory
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
  }
}

export async function remove(categoryId) {
  try {
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    })
    await prisma.$disconnect()
    return true
  } catch (err) {
    logService.error(err)
    await prisma.$disconnect()
    return false
  }
}
