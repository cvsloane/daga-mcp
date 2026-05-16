import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDagaClient } from '../clients/daga-api-client.js'
import {
  getProgressOverviewSchema,
  getCourseProgressSchema,
  completeLessonSchema,
} from '../schemas/tool-schemas.js'
import { createSuccessResult, createErrorResult } from '../utils/results.js'
import { createDryRunResult, createTestModeResult, isTestMode, resolveDryRun } from '../utils/safety.js'

export function registerProgressTools(server: McpServer): void {
  const client = getDagaClient()

  server.tool(
    'daga_get_progress_overview',
    'Get your progress across all DAGA courses',
    getProgressOverviewSchema.shape,
    async () => {
      try {
        const progress = await client.getProgressOverview()

        if (progress.courses.length === 0) {
          return createSuccessResult('No course progress yet. Start a course to begin tracking.')
        }

        const summary = progress.courses.map((course) => ({
          course: course.courseTitle,
          slug: course.courseSlug,
          progress: `${course.completedLessons}/${course.totalLessons} lessons (${course.percentComplete}%)`,
          started: course.startedAt,
          completed: course.completedAt,
        }))

        return createSuccessResult(summary)
      } catch (error) {
        return createErrorResult('Failed to get progress overview', error)
      }
    },
  )

  server.tool(
    'daga_get_course_progress',
    'Get detailed per-lesson progress for a specific DAGA course',
    getCourseProgressSchema.shape,
    async ({ course_slug }) => {
      try {
        const progress = await client.getCourseProgress(course_slug)

        const detail = {
          course: progress.courseTitle,
          slug: progress.courseSlug,
          overall: `${progress.completedLessons}/${progress.totalLessons} (${progress.percentComplete}%)`,
          started: progress.startedAt,
          completed: progress.completedAt,
          modules: progress.modules.map((mod) => ({
            module: mod.title,
            lessons: mod.lessons.map((lesson) => ({
              title: lesson.title,
              slug: lesson.slug,
              completed: lesson.completed,
              completedAt: lesson.completedAt,
            })),
          })),
        }

        return createSuccessResult(detail)
      } catch (error) {
        return createErrorResult(`Failed to get progress for "${course_slug}"`, error)
      }
    },
  )

  server.tool(
    'daga_complete_lesson',
    'Mark a DAGA lesson as completed',
    completeLessonSchema.shape,
    async ({ course_slug, lesson_slug, dry_run }) => {
      try {
        const details = { course_slug, lesson_slug, action: 'complete_lesson' }
        const testMode = isTestMode()
        const effectiveDryRun = testMode ? true : resolveDryRun(dry_run)

        if (effectiveDryRun) {
          return testMode
            ? createTestModeResult(`Complete DAGA lesson "${lesson_slug}"`, details)
            : createDryRunResult(`Complete DAGA lesson "${lesson_slug}"`, details)
        }

        const result = await client.completeLesson(course_slug, lesson_slug)

        const message = result.courseCompleted
          ? `Lesson "${result.lessonTitle}" marked complete! Course completed! (${result.completedLessons}/${result.totalLessons})`
          : `Lesson "${result.lessonTitle}" marked complete (${result.completedLessons}/${result.totalLessons}, ${result.percentComplete}%)`

        return createSuccessResult({
          message,
          lessonTitle: result.lessonTitle,
          courseCompleted: result.courseCompleted,
          progress: `${result.completedLessons}/${result.totalLessons} (${result.percentComplete}%)`,
        })
      } catch (error) {
        return createErrorResult(`Failed to complete lesson "${lesson_slug}"`, error)
      }
    },
  )
}
