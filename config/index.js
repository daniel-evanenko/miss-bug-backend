import configProd from './prod.js'
import configDev from './dev.js'

export var config

if (process.env.NODE_ENV === 'production') {
  if (!process.env.MONGO_URL || !process.env.DB_NAME) {
    console.error('Error: MONGO_URL and DB_NAME environment variables must be set in production.')
    process.exit(1)
  }
  config = configProd
} else {
  config = configDev
}

// Optional: Guest mode logic remains the same
// config.isGuestMode = true;

// The line to force production config should be removed
// config = configProd;