#!/usr/bin/env node

import { config } from 'dotenv'
import { startServer } from './server.js'

config({ path: '.env.local' })

const requiredEnvVars = ['DAGA_API_URL', 'DAGA_API_KEY']
const missingVars = requiredEnvVars.filter(v => !process.env[v])

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`)
  console.error('Set these as environment variables, or use .env.local only for local development.')
  console.error('Generate an API key from your DAGA dashboard at /dashboard/api-keys')
  process.exit(1)
}

startServer().catch((error) => {
  console.error('Failed to start DAGA MCP server:', error)
  process.exit(1)
})
