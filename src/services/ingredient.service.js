import * as ingredientRepository from '../repositories/ingredient.repository.js'
import * as llmService from './llm.service.js'
import * as logService from './log.service.js'

export async function get() {
  return await ingredientRepository.get()
}

export async function getById(id) {
  return await ingredientRepository.getById(id)
}

export async function processRecipe(recipe) {
  const ingredientNames = await llmService.extractIngredients(recipe)
  let ingredients = []

  // Save or get the ingredients from the recipe
  ingredientNames.map(async (name) => ingredients.push(await ingredientRepository.createOrGet({ name: name })))

  // Link the ingredients to the recipe
  await ingredientRepository.saveToRecipe(ingredients, recipe.id)
}
