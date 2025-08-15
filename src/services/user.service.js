import * as userRepository from '../repositories/user.repository.js'

export async function getAll() {
  return await userRepository.getAll()
}

export async function getById(id) {
  return await userRepository.getById(id)
}

export async function getByEmail(email) {
  return await userRepository.getByEmail(email)
}

export async function create(userProfile) {
  return await userRepository.create(userProfile)
}

export async function findOrCreate(userProfile) {
  return await userRepository.findOrCreate(userProfile)
}

export async function getInfo(id) {
  return await userRepository.getInfo(id)
}
