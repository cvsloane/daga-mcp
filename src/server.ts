import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  registerCourseTools,
  registerDiscussionTools,
  registerProductTools,
  registerProfileTools,
  registerProgressTools,
} from './tools/index.js'

const SERVER_NAME = 'daga-mcp'
const SERVER_VERSION = '1.0.0'

export async function createServer(): Promise<McpServer> {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  })

  registerCourseTools(server)
  registerProgressTools(server)
  registerProductTools(server)
  registerDiscussionTools(server)
  registerProfileTools(server)

  return server
}

export async function startServer(): Promise<void> {
  const server = await createServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)

  console.error(`${SERVER_NAME} v${SERVER_VERSION} started`)
}
