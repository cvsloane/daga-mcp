import type { ToolResult } from '../types/index.js'

export function isDryRunDefault(): boolean {
  return process.env.DAGA_ENABLE_DRY_RUN_BY_DEFAULT !== 'false'
}

export function resolveDryRun(dryRun?: boolean): boolean {
  return typeof dryRun === 'boolean' ? dryRun : isDryRunDefault()
}

export function isTestMode(): boolean {
  return process.env.DAGA_TEST_MODE === 'true'
}

export function createDryRunResult(
  operation: string,
  details?: Record<string, unknown>,
): ToolResult {
  const message = [
    `DRY RUN - ${operation}`,
    '',
    'No API call was made.',
  ]

  if (details) {
    message.push('', 'Details:', JSON.stringify(details, null, 2))
  }

  message.push('', 'To execute this operation, set dry_run=false.')

  return {
    content: [{
      type: 'text',
      text: message.join('\n'),
    }],
  }
}

export function createTestModeResult(
  operation: string,
  details?: Record<string, unknown>,
): ToolResult {
  const message = [
    `TEST MODE - ${operation}`,
    '',
    'No API call was made. Disable DAGA_TEST_MODE to execute.',
  ]

  if (details) {
    message.push('', 'Details:', JSON.stringify(details, null, 2))
  }

  return {
    content: [{
      type: 'text',
      text: message.join('\n'),
    }],
  }
}
