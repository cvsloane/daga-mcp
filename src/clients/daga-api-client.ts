import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  CourseCatalog,
  CourseOutline,
  CourseProgressDetail,
  CourseSearchResults,
  DiscussionSearchResults,
  DiscussionTopics,
  LessonContent,
  LessonDiscussionThread,
  LessonProgressResult,
  ProductCatalog,
  ProductLaunchResult,
  ProgressOverview,
  UserProfile,
} from '../types/index.js'

export class DagaApiClient {
  private client: AxiosInstance

  constructor(apiUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: `${apiUrl.replace(/\/$/, '')}/api/mcp`,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const data = error.response?.data as { error?: string } | undefined
        const message = data?.error || error.message
        const status = error.response?.status

        return Promise.reject(new Error(
          status ? `DAGA API error (${status}): ${message}` : `DAGA API error: ${message}`,
        ))
      },
    )
  }

  async getProfile(): Promise<UserProfile> {
    const { data } = await this.client.get('/profile')
    return data
  }

  async getCourses(group?: string): Promise<CourseCatalog> {
    const params = group ? { group } : undefined
    const { data } = await this.client.get('/courses', { params })
    return data
  }

  async getCourseOutline(courseSlug: string): Promise<CourseOutline> {
    const { data } = await this.client.get(`/courses/${courseSlug}`)
    return data
  }

  async getLessonContent(courseSlug: string, lessonSlug: string): Promise<LessonContent> {
    const { data } = await this.client.get(`/courses/${courseSlug}/lessons/${lessonSlug}`)
    return data
  }

  async searchCourses(query: string, courseSlug?: string): Promise<CourseSearchResults> {
    const params: Record<string, string> = { q: query }
    if (courseSlug) params.course = courseSlug
    const { data } = await this.client.get('/courses/search', { params })
    return data
  }

  // Progress
  async getProgressOverview(): Promise<ProgressOverview> {
    const { data } = await this.client.get('/progress')
    return data
  }

  async getCourseProgress(courseSlug: string): Promise<CourseProgressDetail> {
    const { data } = await this.client.get(`/progress/${courseSlug}`)
    return data
  }

  async completeLesson(courseSlug: string, lessonSlug: string): Promise<LessonProgressResult> {
    const { data } = await this.client.post(`/progress/${courseSlug}/lessons/${lessonSlug}`, {
      completed: true,
    })
    return data
  }

  // Products
  async getProducts(): Promise<ProductCatalog> {
    const { data } = await this.client.get('/products')
    return data
  }

  async launchProduct(productSlug: string): Promise<ProductLaunchResult> {
    const { data } = await this.client.post(`/products/${productSlug}/launch`)
    return data
  }

  // Discussions
  async getCourseDiscussions(courseSlug: string, limit?: number): Promise<DiscussionTopics> {
    const params = limit ? { limit: String(limit) } : undefined
    const { data } = await this.client.get(`/discussions/courses/${courseSlug}`, { params })
    return data
  }

  async getLessonDiscussion(courseSlug: string, lessonSlug: string, limit?: number): Promise<LessonDiscussionThread> {
    const params = limit ? { limit: String(limit) } : undefined
    const { data } = await this.client.get(`/discussions/courses/${courseSlug}/lessons/${lessonSlug}`, { params })
    return data
  }

  async searchDiscussions(query: string, courseSlug?: string): Promise<DiscussionSearchResults> {
    const params: Record<string, string> = { q: query }
    if (courseSlug) params.course = courseSlug
    const { data } = await this.client.get('/discussions/search', { params })
    return data
  }
}

let clientInstance: DagaApiClient | null = null

export function getDagaClient(): DagaApiClient {
  if (!clientInstance) {
    const apiUrl = process.env.DAGA_API_URL
    const apiKey = process.env.DAGA_API_KEY

    if (!apiUrl || !apiKey) {
      throw new Error('DAGA_API_URL and DAGA_API_KEY must be set')
    }

    clientInstance = new DagaApiClient(apiUrl, apiKey)
  }

  return clientInstance
}
