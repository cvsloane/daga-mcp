import type { ToolResult } from '../types/index.js'

export function createSuccessResult(data: unknown): ToolResult {
  return {
    content: [{
      type: 'text',
      text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
    }],
  }
}

export function createErrorResult(message: string, error?: unknown): ToolResult {
  let errorMessage = message

  if (error instanceof Error) {
    errorMessage = `${message}: ${error.message}`
  } else if (error) {
    errorMessage = `${message}: ${String(error)}`
  }

  return {
    content: [{
      type: 'text',
      text: errorMessage,
    }],
    isError: true,
  }
}
