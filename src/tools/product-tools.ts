import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getDagaClient } from '../clients/daga-api-client.js'
import { listProductsSchema, launchProductSchema } from '../schemas/tool-schemas.js'
import { createSuccessResult, createErrorResult } from '../utils/results.js'

export function registerProductTools(server: McpServer): void {
  const client = getDagaClient()

  server.tool(
    'daga_list_products',
    'List hosted products included with your DAGA membership',
    listProductsSchema.shape,
    async () => {
      try {
        const catalog = await client.getProducts()

        const products = catalog.products.map((product) => ({
          name: product.title,
          slug: product.slug,
          status: product.statusLabel,
          action: product.actionLabel,
          actionState: product.actionState,
          description: product.description,
          note: product.note,
        }))

        return createSuccessResult(products)
      } catch (error) {
        return createErrorResult('Failed to list products', error)
      }
    },
  )

  server.tool(
    'daga_launch_product',
    'Get a launch URL for a hosted DAGA product',
    launchProductSchema.shape,
    async ({ product_slug }) => {
      try {
        const result = await client.launchProduct(product_slug)

        return createSuccessResult({
          message: `Launch URL generated for ${product_slug}. This URL expires in 5 minutes.`,
          url: result.url,
        })
      } catch (error) {
        return createErrorResult(`Failed to launch product "${product_slug}"`, error)
      }
    },
  )
}
