export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>
  isError?: boolean
}

export type MembershipTier = 'free' | 'core' | 'pro'
export type BillingStatus = 'inactive' | 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid'
export type ContentType = 'text' | 'video' | 'download'
export type CurriculumGroup = 'flagship' | 'paid' | 'legacy'

export type UserProfile = {
  id: number
  name: string
  email: string
  membershipTier: MembershipTier
  billingStatus: BillingStatus
  xp: number
  role: string
}

export type CourseSummary = {
  id: number
  title: string
  slug: string
  description: string
  requiredTier: MembershipTier
  curriculumGroup: CurriculumGroup
  coursePromise: string
  audience: string
  thumbnail: string | null
  hasAccess: boolean
}

export type CurriculumSection = {
  key: CurriculumGroup
  title: string
  description: string
  courses: CourseSummary[]
}

export type CourseCatalog = {
  sections: CurriculumSection[]
}

export type LessonSummary = {
  id: number
  title: string
  slug: string
  contentType: ContentType
  duration: number | null
  learningObjective: string | null
  isFreePreview: boolean
}

export type ModuleOutline = {
  id: number
  title: string
  order: number
  outcome: string | null
  lessons: LessonSummary[]
}

export type CourseOutline = {
  id: number
  title: string
  slug: string
  description: string
  coursePromise: string
  audience: string
  successOutcome: string
  requiredTier: MembershipTier
  curriculumGroup: CurriculumGroup
  thumbnail: string | null
  hasAccess: boolean
  modules: ModuleOutline[]
}

export type LessonContent = {
  id: number
  title: string
  slug: string
  contentType: ContentType
  duration: number | null
  learningObjective: string | null
  isFreePreview: boolean
  content: string | null
  muxPlaybackId?: string
  course: {
    id: number
    title: string
    slug: string
  }
  module: {
    id: number
    title: string
  }
}

// Progress types
export type CourseProgressSummary = {
  courseId: number
  courseTitle: string
  courseSlug: string
  totalLessons: number
  completedLessons: number
  percentComplete: number
  startedAt: string | null
  completedAt: string | null
}

export type ProgressOverview = {
  courses: CourseProgressSummary[]
}

export type LessonProgressEntry = {
  id: number
  title: string
  slug: string
  completed: boolean
  completedAt: string | null
  lastViewedAt: string | null
}

export type ModuleProgress = {
  title: string
  order: number
  lessons: LessonProgressEntry[]
}

export type CourseProgressDetail = CourseProgressSummary & {
  modules: ModuleProgress[]
}

export type LessonProgressResult = {
  lessonId: number
  lessonTitle: string
  completed: boolean
  courseCompleted: boolean
  totalLessons: number
  completedLessons: number
  percentComplete: number
}

// Product types
export type ProductEntry = {
  slug: string
  title: string
  description: string
  statusLabel: string
  actionLabel: string
  actionState: 'launch' | 'none' | 'unconfigured' | 'upgrade'
  configured: boolean
  note: string
  setupLabel: string
  launchUrl: string | null
  accessMode: string | null
  status: string | null
}

export type ProductCatalog = {
  products: ProductEntry[]
}

export type ProductLaunchResult = {
  url: string
}

// Discussion types
export type DiscussionTopic = {
  id: number
  title: string
  slug: string
  postsCount: number
  lastPostedAt: string | null
  createdAt: string
}

export type DiscussionTopics = {
  courseTitle: string
  courseSlug: string
  discourseCategoryId: number
  topics: DiscussionTopic[]
}

export type DiscussionPost = {
  id: number
  username: string
  raw: string
  createdAt: string
  updatedAt: string
  postNumber: number
}

export type LessonDiscussionThread = {
  lessonTitle: string
  lessonSlug: string
  courseTitle: string
  courseSlug: string
  discourseTopicId: number
  topicTitle: string
  posts: DiscussionPost[]
}

export type DiscussionSearchEntry = {
  id: number
  title: string
  slug: string
  categoryId: number | null
  blurb: string
}

export type DiscussionSearchResults = {
  query: string
  courseSlug: string | null
  results: DiscussionSearchEntry[]
}

// Course search types
export type CourseSearchEntry = {
  course: string
  courseSlug: string
  lesson?: string
  lessonSlug?: string
  match: string
  learningObjective?: string | null
}

export type CourseSearchResults = {
  query: string
  courseSlug: string | null
  resultCount: number
  results: CourseSearchEntry[]
}
