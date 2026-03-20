import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDagaClient } from '../clients/daga-api-client.js'
import {
  listCoursesSchema,
  getCourseOutlineSchema,
  readLessonSchema,
  searchCoursesSchema,
} from '../schemas/tool-schemas.js'
import { createSuccessResult, createErrorResult } from '../utils/results.js'

export function registerCourseTools(server: McpServer): void {
  const client = getDagaClient()

  server.tool(
    'daga_list_courses',
    'List published DAGA courses grouped by curriculum section (flagship/paid/legacy)',
    listCoursesSchema.shape,
    async ({ group }) => {
      try {
        const catalog = await client.getCourses(group)

        const summary = catalog.sections.map((section) => ({
          section: section.title,
          description: section.description,
          courses: section.courses.map((course) => ({
            title: course.title,
            slug: course.slug,
            tier: course.requiredTier,
            hasAccess: course.hasAccess,
            description: course.description,
          })),
        }))

        return createSuccessResult(summary)
      } catch (error) {
        return createErrorResult('Failed to list courses', error)
      }
    },
  )

  server.tool(
    'daga_get_course_outline',
    'Get full course structure with modules and lessons',
    getCourseOutlineSchema.shape,
    async ({ course_slug }) => {
      try {
        const outline = await client.getCourseOutline(course_slug)

        const summary = {
          title: outline.title,
          slug: outline.slug,
          tier: outline.requiredTier,
          hasAccess: outline.hasAccess,
          description: outline.description,
          coursePromise: outline.coursePromise,
          audience: outline.audience,
          successOutcome: outline.successOutcome,
          modules: outline.modules.map((mod) => ({
            title: mod.title,
            outcome: mod.outcome,
            lessons: mod.lessons.map((lesson) => ({
              title: lesson.title,
              slug: lesson.slug,
              type: lesson.contentType,
              duration: lesson.duration,
              objective: lesson.learningObjective,
              freePreview: lesson.isFreePreview,
            })),
          })),
        }

        return createSuccessResult(summary)
      } catch (error) {
        return createErrorResult(`Failed to get course outline for "${course_slug}"`, error)
      }
    },
  )

  server.tool(
    'daga_read_lesson',
    'Read the full content of a DAGA lesson as markdown',
    readLessonSchema.shape,
    async ({ course_slug, lesson_slug }) => {
      try {
        const lesson = await client.getLessonContent(course_slug, lesson_slug)

        const header = [
          `# ${lesson.title}`,
          '',
          `**Course**: ${lesson.course.title}`,
          `**Module**: ${lesson.module.title}`,
          lesson.learningObjective ? `**Objective**: ${lesson.learningObjective}` : null,
          lesson.contentType === 'video' ? `**Type**: Video lesson` : null,
          lesson.duration ? `**Duration**: ${lesson.duration} min` : null,
          '',
          '---',
          '',
        ].filter(Boolean).join('\n')

        if (lesson.contentType === 'video') {
          const baseUrl = (process.env.DAGA_API_URL || 'https://digitalagencygrowthacademy.com').replace(/\/$/, '')

          return createSuccessResult(
            `${header}This is a video lesson. Watch it at: ${baseUrl}/courses/${course_slug}/lessons/${lesson_slug}`,
          )
        }

        if (!lesson.content) {
          return createSuccessResult(`${header}(No text content available for this lesson.)`)
        }

        return createSuccessResult(`${header}${lesson.content}`)
      } catch (error) {
        return createErrorResult(`Failed to read lesson "${lesson_slug}"`, error)
      }
    },
  )

  server.tool(
    'daga_search_courses',
    'Search across DAGA course and lesson titles and learning objectives',
    searchCoursesSchema.shape,
    async ({ query, course_slug }) => {
      try {
        const searchResults = await client.searchCourses(query, course_slug)

        if (searchResults.resultCount === 0) {
          return createSuccessResult(`No results found for "${query}"`)
        }

        return createSuccessResult({
          query: searchResults.query,
          resultCount: searchResults.resultCount,
          results: searchResults.results.map((r) => ({
            course: r.course,
            courseSlug: r.courseSlug,
            lesson: r.lesson,
            lessonSlug: r.lessonSlug,
            match: r.match,
          })),
        })
      } catch (error) {
        return createErrorResult(`Failed to search courses for "${query}"`, error)
      }
    },
  )
}
