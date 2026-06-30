import { prisma } from '../db/client.js'
import * as logService from '../services/log.service.js'

export async function get() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    return categories
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
  }
}

export async function getById(id) {
  try {
    const category = await prisma.category.findUnique({ where: { id: id } })
    return category
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
  }
}

export async function upsert(category) {
  try {
    let existingCategory = null
    if (category.id) {
      existingCategory = await prisma.category.findUnique({ where: { id: category.id } })
      if (!existingCategory) {
        throw new Error(`upsert of category: ${category.id} had no result.`)
      }
      existingCategory = await prisma.category.update({
        data: {
          ...category,
        },
        where: { id: category.id },
      })
    } else {
      existingCategory = await prisma.category.create({
        data: {
          ...category,
        },
      })
    }
    return existingCategory
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return null
  }
}

export async function remove(categoryId) {
  try {
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    })
    return true
  } catch (err) {
    await logService.error(JSON.stringify(err))
    return false
  }
}
