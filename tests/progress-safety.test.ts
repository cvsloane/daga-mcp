import test, { after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDagaClient } from '../src/clients/daga-api-client.js'
import { completeLessonSchema } from '../src/schemas/tool-schemas.js'
import { registerProgressTools } from '../src/tools/progress-tools.js'
import { isDryRunDefault, resolveDryRun } from '../src/utils/safety.js'

type ToolHandler = (args: Record<string, unknown>) => Promise<{
  content: Array<{ type: string; text: string }>
  isError?: boolean
}>

const originalEnv = {
  DAGA_API_URL: process.env.DAGA_API_URL,
  DAGA_API_KEY: process.env.DAGA_API_KEY,
  DAGA_ENABLE_DRY_RUN_BY_DEFAULT: process.env.DAGA_ENABLE_DRY_RUN_BY_DEFAULT,
  DAGA_TEST_MODE: process.env.DAGA_TEST_MODE,
}

function resetEnv() {
  process.env.DAGA_API_URL = 'https://daga.test'
  process.env.DAGA_API_KEY = 'test-api-key'
  delete process.env.DAGA_ENABLE_DRY_RUN_BY_DEFAULT
  delete process.env.DAGA_TEST_MODE
}

function restoreEnv() {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

function createToolRegistry() {
  const handlers = new Map<string, ToolHandler>()
  const server = {
    tool: (
      name: string,
      _description: string,
      _schema: unknown,
      handler: ToolHandler,
    ) => {
      handlers.set(name, handler)
    },
  } as unknown as McpServer

  return {
    server,
    handler(name: string): ToolHandler {
      const handler = handlers.get(name)
      assert.ok(handler, `Expected ${name} to be registered`)
      return handler
    },
  }
}

function resultText(result: Awaited<ReturnType<ToolHandler>>): string {
  return result.content.map(item => item.text).join('\n')
}

function stubClientMethod(methodName: string) {
  const client = getDagaClient() as unknown as Record<string, unknown>
  const original = client[methodName]
  const calls: unknown[][] = []

  client[methodName] = async (...args: unknown[]) => {
    calls.push(args)
    return {
      lessonId: 123,
      lessonTitle: 'Mock Lesson',
      completed: true,
      courseCompleted: false,
      totalLessons: 10,
      completedLessons: 4,
      percentComplete: 40,
    }
  }

  return {
    calls,
    restore: () => {
      client[methodName] = original
    },
  }
}

beforeEach(resetEnv)
after(restoreEnv)

test('lesson completion defaults to dry-run when env vars are absent', () => {
  assert.equal(isDryRunDefault(), true)
  assert.equal(resolveDryRun(undefined), true)
  assert.equal(resolveDryRun(false), false)
})

test('complete lesson schema accepts explicit dry-run control', () => {
  const result = completeLessonSchema.safeParse({
    course_slug: 'ai-native-agency-foundations',
    lesson_slug: 'setting-up-obsidian',
    dry_run: false,
  })

  assert.equal(result.success, true)
})

test('daga_complete_lesson makes no API call by default', async () => {
  const completeLesson = stubClientMethod('completeLesson')
  const registry = createToolRegistry()
  registerProgressTools(registry.server)

  const result = await registry.handler('daga_complete_lesson')({
    course_slug: 'ai-native-agency-foundations',
    lesson_slug: 'setting-up-obsidian',
  })

  assert.equal(completeLesson.calls.length, 0)
  assert.match(resultText(result), /DRY RUN - Complete DAGA lesson "setting-up-obsidian"/)
  completeLesson.restore()
})

test('daga_complete_lesson only calls the API after explicit dry_run=false', async () => {
  const completeLesson = stubClientMethod('completeLesson')
  const registry = createToolRegistry()
  registerProgressTools(registry.server)

  const result = await registry.handler('daga_complete_lesson')({
    course_slug: 'ai-native-agency-foundations',
    lesson_slug: 'setting-up-obsidian',
    dry_run: false,
  })

  assert.deepEqual(completeLesson.calls, [['ai-native-agency-foundations', 'setting-up-obsidian']])
  assert.match(resultText(result), /Mock Lesson.*marked complete/s)
  completeLesson.restore()
})

test('DAGA_TEST_MODE blocks completion even when dry_run=false', async () => {
  process.env.DAGA_TEST_MODE = 'true'
  const completeLesson = stubClientMethod('completeLesson')
  const registry = createToolRegistry()
  registerProgressTools(registry.server)

  const result = await registry.handler('daga_complete_lesson')({
    course_slug: 'ai-native-agency-foundations',
    lesson_slug: 'setting-up-obsidian',
    dry_run: false,
  })

  assert.equal(completeLesson.calls.length, 0)
  assert.match(resultText(result), /TEST MODE - Complete DAGA lesson/)
  completeLesson.restore()
})
