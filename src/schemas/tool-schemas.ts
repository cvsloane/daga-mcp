import { z } from 'zod'

export const courseSlugSchema = z.string().describe('Course URL slug (e.g., "ai-native-agency-foundations")')
export const lessonSlugSchema = z.string().describe('Lesson URL slug (e.g., "setting-up-obsidian")')

// Course tools
export const listCoursesSchema = z.object({
  group: z.enum(['flagship', 'paid', 'legacy']).optional().describe(
    'Filter by curriculum group: flagship (free), paid (core/pro), legacy (archived)',
  ),
})

export const getCourseOutlineSchema = z.object({
  course_slug: courseSlugSchema,
})

export const readLessonSchema = z.object({
  course_slug: courseSlugSchema,
  lesson_slug: lessonSlugSchema,
})

export const searchCoursesSchema = z.object({
  query: z.string().describe('Search query to match against course/lesson titles and objectives'),
  course_slug: courseSlugSchema.optional().describe('Limit search to a specific course'),
})

// Profile tools
export const getProfileSchema = z.object({})
export const getCommunityInfoSchema = z.object({})

// Progress tools
export const getProgressOverviewSchema = z.object({})

export const getCourseProgressSchema = z.object({
  course_slug: courseSlugSchema,
})

export const completeLessonSchema = z.object({
  course_slug: courseSlugSchema,
  lesson_slug: lessonSlugSchema,
})

// Product tools
export const listProductsSchema = z.object({})

export const launchProductSchema = z.object({
  product_slug: z.string().describe('Product slug (e.g., "agency-commander", "hg-market-report")'),
})

// Discussion tools
export const getCourseDiscussionsSchema = z.object({
  course_slug: courseSlugSchema,
  limit: z.number().optional().describe('Maximum number of topics to return (default 20, max 50)'),
})

export const getLessonDiscussionSchema = z.object({
  course_slug: courseSlugSchema,
  lesson_slug: lessonSlugSchema,
  limit: z.number().optional().describe('Maximum number of posts to return (default 20, max 50)'),
})

export const searchDiscussionsSchema = z.object({
  query: z.string().describe('Search query for community discussions'),
  course_slug: courseSlugSchema.optional().describe('Limit search to a specific course category'),
})
