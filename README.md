# daga-mcp

Thin stdio MCP client for Digital Agency Growth Academy (DAGA).

`daga-mcp` connects Claude Code, Codex, and other MCP-compatible clients to a signed-in DAGA member account through DAGA API keys. The client is intentionally small: it reads `DAGA_API_URL` and `DAGA_API_KEY`, then exposes DAGA tools over stdio.

## Requirements

- Node.js 18+
- A DAGA member account
- A DAGA API key from `https://digitalagencygrowthacademy.com/dashboard/api-keys`

## Install in Claude Code

Generate a DAGA API key in the dashboard, copy it immediately, and register the MCP:

```bash
claude mcp add \
  -e DAGA_API_URL=https://digitalagencygrowthacademy.com \
  -e DAGA_API_KEY=daga_... \
  daga \
  -- npx -y daga-mcp
```

Verify the registration:

```bash
claude mcp list
```

## Install in Codex

```bash
codex mcp add daga \
  --env DAGA_API_URL=https://digitalagencygrowthacademy.com \
  --env DAGA_API_KEY=daga_... \
  -- npx -y daga-mcp
```

## Safety

- Treat `DAGA_API_KEY` like a password.
- Do not paste raw keys into notes, screenshots, docs, chat transcripts, or committed files.
- Do not commit `.env.local`.
- Revoke the key in DAGA immediately if you think it was exposed.
- Progress-changing tools default to dry-run mode. Set `dry_run=false` on the tool call to mark a lesson complete.
- Set `DAGA_TEST_MODE=true` to force all progress mutations to simulate without API writes.

## Local development

For local testing only, you can copy the example env file:

```bash
cp .env.local.example .env.local
```

Then set a real key in `.env.local` and run:

```bash
npm install
npm run dev
```

Build the published client locally:

```bash
npm run build
```

## Available tools

Course tools:

- `daga_list_courses`
- `daga_get_course_outline`
- `daga_read_lesson`
- `daga_search_courses`

Progress tools:

- `daga_get_progress_overview`
- `daga_get_course_progress`
- `daga_complete_lesson`

Product tools:

- `daga_list_products`
- `daga_launch_product`

Discussion tools:

- `daga_get_course_discussions`
- `daga_get_lesson_discussion`
- `daga_search_discussions`

Profile tools:

- `daga_get_profile`
- `daga_get_community_info`

## Notes

- API keys inherit the member's current DAGA tier automatically.
- DAGA access checks still apply. A free member only sees free-access content.
- Video lessons return member URLs in the format `/courses/:courseSlug/lessons/:lessonSlug`.

## License

MIT

## Development Status

See [project_status.md](./project_status.md) for recent development activity and context.
