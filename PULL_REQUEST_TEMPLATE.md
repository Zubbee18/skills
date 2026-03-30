## Minimalist Founder OS via Notion MCP

This PR adds a complete Notion MCP-powered AI coaching agent to the repository.

### What's included

- `notion-mcp/agent.js` — Main entry: reads Notion page, routes skill, calls Claude claude-sonnet-4-5, writes coaching callout back
- `notion-mcp/notion-utils.js` — Notion API helpers: recursive block reading, callout writing, title extraction
- `notion-mcp/skills-router.js` — Keyword-scoring engine that maps page text to the right SKILL.md
- `notion-mcp/batch-coach.js` — Bulk coach an entire Notion database with --dry-run support
- `notion-mcp/package.json` — Node.js 18+, ESM, all dependencies
- `notion-mcp/.env.example` — Template for API keys
- `notion-mcp/README.md` — Full setup and usage docs
- `demo/sample-notion-page.md` — Demo showing input page and agent output

### How it works

1. READ — Fetches Notion page content via Notion API
2. ROUTE — Detects which of the 10 skills best matches the page
3. COACH — Sends page + skill framework to Claude claude-sonnet-4-5
4. WRITE — Appends a coaching callout block back to the Notion page

### Quick start

```bash
cd notion-mcp
npm install
cp .env.example .env
# Add your NOTION_API_KEY, ANTHROPIC_API_KEY, NOTION_PAGE_ID
node agent.js
```