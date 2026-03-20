import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDagaClient } from '../clients/daga-api-client.js'
import {
  getCourseDiscussionsSchema,
  getLessonDiscussionSchema,
  searchDiscussionsSchema,
} from '../schemas/tool-schemas.js'
import { createSuccessResult, createErrorResult } from '../utils/results.js'

export function registerDiscussionTools(server: McpServer): void {
  const client = getDagaClient()

  server.tool(
    'daga_get_course_discussions',
    'Get recent discussion topics for a DAGA course',
    getCourseDiscussionsSchema.shape,
    async ({ course_slug, limit }) => {
      try {
        const discussions = await client.getCourseDiscussions(course_slug, limit)

        if (discussions.topics.length === 0) {
          return createSuccessResult(`No discussions found for "${discussions.courseTitle}"`)
        }

        const topics = discussions.topics.map((topic) => ({
          title: topic.title,
          posts: topic.postsCount,
          lastActivity: topic.lastPostedAt,
        }))

        return createSuccessResult({
          course: discussions.courseTitle,
          topicCount: topics.length,
          topics,
        })
      } catch (error) {
        return createErrorResult(`Failed to get discussions for "${course_slug}"`, error)
      }
    },
  )

  server.tool(
    'daga_get_lesson_discussion',
    'Get the discussion thread for a specific DAGA lesson',
    getLessonDiscussionSchema.shape,
    async ({ course_slug, lesson_slug, limit }) => {
      try {
        const thread = await client.getLessonDiscussion(course_slug, lesson_slug, limit)

        if (thread.posts.length === 0) {
          return createSuccessResult(`No discussion posts for "${thread.lessonTitle}" yet`)
        }

        const posts = thread.posts.map((post) => ({
          author: post.username,
          content: post.raw,
          date: post.createdAt,
          postNumber: post.postNumber,
        }))

        return createSuccessResult({
          lesson: thread.lessonTitle,
          course: thread.courseTitle,
          topic: thread.topicTitle,
          postCount: posts.length,
          posts,
        })
      } catch (error) {
        return createErrorResult(`Failed to get discussion for "${lesson_slug}"`, error)
      }
    },
  )

  server.tool(
    'daga_search_discussions',
    'Search DAGA community discussions',
    searchDiscussionsSchema.shape,
    async ({ query, course_slug }) => {
      try {
        const results = await client.searchDiscussions(query, course_slug)

        if (results.results.length === 0) {
          return createSuccessResult(`No discussion results found for "${query}"`)
        }

        return createSuccessResult({
          query: results.query,
          resultCount: results.results.length,
          results: results.results.map((result) => ({
            title: result.title,
            blurb: result.blurb,
          })),
        })
      } catch (error) {
        return createErrorResult(`Failed to search discussions for "${query}"`, error)
      }
    },
  )
}
