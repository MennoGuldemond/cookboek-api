import * as logRepository from '../repositories/log.repository.js'

export async function Error(message) {
  return await logRepository.create(message, 'Error')
}

export async function Warning(message) {
  return await logRepository.create(message, 'Warning')
}

export async function Info(message) {
  return await logRepository.create(message, 'Info')
}
