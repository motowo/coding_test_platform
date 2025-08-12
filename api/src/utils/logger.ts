import pino from 'pino'
import { config } from './config'

export const logger = pino({
  level: config.log.level,
  formatters: {
    level(label) {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})