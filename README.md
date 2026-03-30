# 📓 Minimalist Founder OS — Notion MCP Coaching Agent

An AI-powered coaching agent that reads your Notion pages and writes back structured, actionable coaching — automatically. Built on the [Minimalist Entrepreneur](https://www.minimalistentrepreneur.com/) framework by Sahil Lavingia.

No paid AI subscription needed. Uses the **free tier of OpenRouter**.

> **Note:** This is a fork of [slavingia/skills](https://github.com/slavingia/skills)
> by Sahil Lavingia. The `notion-mcp/` directory is original work added by
> [Deborah Anyachukwu](https://github.com/Zubbee18).
---

## What It Does

You write your startup notes in Notion. The agent reads them, figures out what stage you're at, picks the right coaching framework, generates personalised advice, and writes it straight back into your Notion page as a formatted callout block.

### The 4-Step Workflow

```
1. READ   — Fetches your Notion page content via the Notion API
2. ROUTE  — Detects which of the 10 Minimalist Entrepreneur skills best matches your content
3. COACH  — Sends your page + the skill framework to an AI model for personalised coaching
4. WRITE  — Appends a structured coaching callout block back to your Notion page
```

### What the Coaching Looks Like

Every coaching response is structured into 4 clear sections written directly into your Notion page:

- **ASSESSMENT** — An honest 2-3 sentence evaluation of where you are
- **NEXT STEPS** — 3-5 numbered, specific action items from the skill framework
- **RED FLAGS 🚩 / GREEN FLAGS ✅** — Specific things spotted in your notes
- **KEY QUESTION** — One powerful question to reflect on

---

## Technologies Used

| Technology | Purpose |
|---|---|
| **Node.js 18+** | Runtime environment |
| **[Notion API](https://developers.notion.com/)** (`@notionhq/client`) | Read page content and write coaching callouts back |
| **[OpenRouter](https://openrouter.ai/)** (free tier) | AI model provider — routes to best available free model |
| **`openrouter/free` model** | Auto-selects from 25+ free LLMs (Llama, Gemma, Mistral etc.) |
| **`dotenv`** | Loads API keys from `.env` file |
| **`chalk`** | Coloured terminal output |
| **`ora`** | Terminal spinners for step-by-step feedback |
| **`cli-table3`** | Batch mode results table |
| **`minimist`** | CLI argument parsing (`--dry-run`) |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher — [nodejs.org](https://nodejs.org)
- A Notion account
- A free OpenRouter account — [openrouter.ai](https://openrouter.ai)

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Zubbee18/skills.git
cd skills/notion-mcp
```

---

### Step 2 — Install dependencies

```bash
npm install
```

---

### Step 3 — Get your API keys

#### Notion API Key
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"** → give it a name → click **Save**
3. Copy the **"Internal Integration Secret"** (starts with `secret_...`)

#### OpenRouter API Key (free — no credit card)
1. Go to [openrouter.ai](https://openrouter.ai) → sign in with Google
2. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
3. Click **"Create Key"** → copy it (starts with `sk-or-...`)

#### Notion Page ID
1. Open your Notion page in the browser
2. Copy the 32-character ID from the URL:
```
https://notion.so/My-Page-Title-abc123def456789012345678901234
                               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                               This is your NOTION_PAGE_ID
```

#### Notion Database ID (for batch mode only)
Same as above but open a **Notion database** and copy the ID before the `?v=` in the URL.

---

### Step 4 — Configure your environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PAGE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=                              # optional, for batch mode
```

---

### Step 5 — Connect your Notion integration to your page

1. Open your Notion page (or database)
2. Click `...` in the top right → **Connections** → select your integration

> ⚠️ This step is required. Without it the agent will get a 403 error.

---

### Step 6 — Run it

```bash
# Coach a single Notion page
node agent.js

# or use npm
npm start
```

---

## Usage

### Single Page Mode

Coaches one Notion page (set via `NOTION_PAGE_ID` in `.env`):

```bash
node agent.js
```

**Example output:**
```
📓 Minimalist Founder OS — Notion MCP Coaching Agent

✔ Read page: "My Startup Idea"
✔ Skill detected: validate-idea (confidence: 72%)
✔ Coaching generated!
✔ Coaching callout added to your Notion page!

✅ Done! Open your Notion page to see the coaching.
```

---

### Batch Mode

Coaches every page in a Notion database (set via `NOTION_DATABASE_ID` in `.env`):

```bash
# Dry run — preview only, no writes to Notion
node batch-coach.js --dry-run

# Full run — writes coaching to every page
node batch-coach.js
```

**Example output:**
```
📓 Minimalist Founder OS — Batch Coaching

✔ Found 3 pages
✔ My SaaS Idea → validate-idea (65%)
✔ Pricing Strategy → pricing (80%)
✔ Launch Plan → first-customers (55%)

┌──────────────────────────────────┬───────────────────┬───────────┬────────┐
│ Page                             │ Skill             │ Confidence│ Status │
├──────────────────────────────────┼───────────────────┼───────────┼────────┤
│ My SaaS Idea                     │ validate-idea     │ 65%       │ done   │
│ Pricing Strategy                 │ pricing           │ 80%       │ done   │
│ Launch Plan                      │ first-customers   │ 55%       │ done   │
└──────────────────────────────────┴───────────────────┴───────────┴────────┘

✅ Batch complete: 3/3 pages processed.
```

---

### npm Shortcuts

```bash
npm start           # single page mode
npm run batch       # batch all pages in database
npm run batch:dry   # batch dry run
```

---

## Supported Skills

The agent automatically detects which skill is most relevant to your page content using keyword scoring and loads the matching framework.

| Skill | What it coaches |
|---|---|
| `validate-idea` | Is your idea worth pursuing? Customer discovery & validation |
| `mvp` | What to build first, scope reduction, shipping fast |
| `first-customers` | Getting your first 100 paying users |
| `find-community` | Building an audience before building a product |
| `marketing-plan` | Content, SEO, and sustainable growth marketing |
| `pricing` | How to price, what to charge, revenue models |
| `grow-sustainably` | Scaling without losing profitability or soul |
| `processize` | Systems, automation, delegation, SOPs |
| `company-values` | Culture, mission, hiring principles |
| `minimalist-review` | Periodic reflection and course-correction |

---

## Project Structure

```
notion-mcp/
├── agent.js          # Single page coaching agent
├── batch-coach.js    # Batch database coaching agent
├── notion-utils.js   # Notion API helpers (read pages, write callouts)
├── skills-router.js  # Keyword-based skill detection engine
├── package.json
├── .env.example      # Environment variable template
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NOTION_API_KEY` | ✅ Yes | From notion.so/my-integrations |
| `OPENROUTER_API_KEY` | ✅ Yes | From openrouter.ai/keys (free) |
| `NOTION_PAGE_ID` | ✅ Yes | 32-char ID from your Notion page URL |
| `NOTION_DATABASE_ID` | Optional | 32-char ID — only needed for batch mode |

---

## Skills

1. **Community** — Start by finding your people
2. **Validate** — Make sure the problem is worth solving
3. **Build** — Ship a manual process, then productize it
4. **Processize** — Turn your product idea into a manual process you can deliver today
5. **Sell** — Get to 100 customers one by one
6. **Price** — Charge something from day one
7. **Market** — Build an audience through content
8. **Grow** — Stay profitable, grow sustainably
9. **Culture** — Build the house you want to live in
10. **Review** — Apply minimalist principles to every decision

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

## License

MIT — see [LICENSE](../LICENSE) for details.

### Attribution

This project is built on top of [slavingia/skills](https://github.com/slavingia/skills)
by [Sahil Lavingia](https://github.com/slavingia), which is also MIT licensed.

The Notion MCP integration (`notion-mcp/`) was developed by
[Deborah Anyachukwu](https://github.com/Zubbee18) as an extension of that original work.
