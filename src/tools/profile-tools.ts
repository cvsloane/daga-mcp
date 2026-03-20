import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDagaClient } from '../clients/daga-api-client.js'
import { getProfileSchema, getCommunityInfoSchema } from '../schemas/tool-schemas.js'
import { createSuccessResult, createErrorResult } from '../utils/results.js'

export function registerProfileTools(server: McpServer): void {
  const client = getDagaClient()

  server.tool(
    'daga_get_profile',
    'Get your DAGA member profile including membership tier, XP, and billing status',
    getProfileSchema.shape,
    async () => {
      try {
        const profile = await client.getProfile()

        const tierLabel = {
          free: 'Free',
          core: 'Core ($97/mo)',
          pro: 'Pro ($297/mo)',
        }[profile.membershipTier] || profile.membershipTier

        return createSuccessResult({
          name: profile.name,
          email: profile.email,
          tier: `${tierLabel}`,
          billingStatus: profile.billingStatus,
          xp: profile.xp,
          role: profile.role,
        })
      } catch (error) {
        return createErrorResult('Failed to get profile', error)
      }
    },
  )

  server.tool(
    'daga_get_community_info',
    'Get DAGA community URL and membership information',
    getCommunityInfoSchema.shape,
    async () => {
      try {
        const profile = await client.getProfile()
        const apiUrl = process.env.DAGA_API_URL || 'https://digitalagencygrowthacademy.com'

        return createSuccessResult({
          platform: apiUrl,
          community: `${apiUrl}/community`,
          dashboard: `${apiUrl}/dashboard`,
          tier: profile.membershipTier,
          message: 'Visit the community for discussions, or use daga_list_courses to browse available courses.',
        })
      } catch (error) {
        return createErrorResult('Failed to get community info', error)
      }
    },
  )
}
