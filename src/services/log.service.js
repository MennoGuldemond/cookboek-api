import * as logRepository from '../repositories/log.repository.js'

export async function error(message) {
  return await logRepository.create(message, 'Error')
}

export async function warning(message) {
  return await logRepository.create(message, 'Warning')
}

export async function info(message) {
  return await logRepository.create(message, 'Info')
}
