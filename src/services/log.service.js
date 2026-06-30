import * as logRepository from '../repositories/log.repository.js'

export async function error(message) {
  try {
    return await logRepository.create(message, 'Error')
  } catch (err) {
    console.error('Failed to persist error log:', err)
    return null
  }
}

export async function warning(message) {
  try {
    return await logRepository.create(message, 'Warning')
  } catch (err) {
    console.error('Failed to persist warning log:', err)
    return null
  }
}

export async function info(message) {
  try {
    return await logRepository.create(message, 'Info')
  } catch (err) {
    console.error('Failed to persist info log:', err)
    return null
  }
}
