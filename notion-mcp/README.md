# Minimalist Founder OS — Notion MCP Integration

An AI coaching agent that reads your Notion pages and writes back actionable coaching based on the Minimalist Entrepreneur skills framework, powered by Claude via the Anthropic API.

## How It Works

1. READ   — Fetches your Notion page content via the Notion API
2. ROUTE  — Detects which of the 10 skills best matches your page
3. COACH  — Sends page + skill framework to Claude claude-sonnet-4-5
4. WRITE  — Appends a coaching callout block back to your Notion page

## Setup

### Prerequisites
- Node.js 18+
- A Notion integration with read/write access
- An Anthropic API key

### Installation

```bash
cd notion-mcp
npm install
cp .env.example .env
```

Edit .env with your keys:
- NOTION_API_KEY — from notion.so/my-integrations
- ANTHROPIC_API_KEY — from console.anthropic.com
- NOTION_PAGE_ID — the 32-char ID from your Notion page URL
- NOTION_DATABASE_ID — optional, for batch mode

### Connect Notion Integration to Your Page
1. Open your Notion page
2. Click ... (top right) → Connections → Add your integration

## Usage

### Coach a single page
```bash
node agent.js
```

### Batch coach an entire database
```bash
node batch-coach.js
node batch-coach.js --dry-run
```

### npm shortcuts
```bash
npm start          # single page
npm run batch      # batch all pages in database
npm run batch:dry  # dry run
```

## Supported Skills

| Skill | What it coaches |
|---|---|
| validate-idea | Is your idea worth pursuing? Validation frameworks |
| mvp | What to build first, and what to cut |
| first-customers | How to get your first paying users |
| find-community | Building an audience before a product |
| marketing-plan | Content, SEO, and sustainable growth |
| pricing | How to price, what to charge, revenue models |
| grow-sustainably | Scaling without losing your soul |
| processize | Systems, automation, and delegation |
| company-values | Culture, hiring, and mission |
| minimalist-review | Periodic reflection and course-correction |

The agent automatically detects which skill is most relevant to your page content using keyword scoring.

## License

MIT