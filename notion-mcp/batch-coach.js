import { Client } from '@notionhq/client';
import Anthropic from '@anthropic-ai/sdk';
import { getPageContent, getPageTitle, writeCoachingCallout } from './notion-utils.js';
import { routeSkill } from './skills-router.js';
import Table from 'cli-table3';
import chalk from 'chalk';
import ora from 'ora';
import minimist from 'minimist';
import 'dotenv/config';

const argv = minimist(process.argv.slice(2));
const dryRun = argv['dry-run'] || false;

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function getDatabasePages(databaseId) {
  const pages = [];
  let cursor;
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);
  return pages;
}

async function coachPage(page, anthropic) {
  const pageId = page.id;
  const [pageText, pageTitle] = await Promise.all([
    getPageContent(pageId),
    getPageTitle(pageId),
  ]);

  const { skillName, skillMarkdown, confidence } = await routeSkill(pageText);

  const systemPrompt = `You are a Minimalist Entrepreneur coach. Use ONLY the principles from the provided SKILL document. Be direct, specific, and actionable. Use ALL CAPS for section titles.`;
  const userPrompt = `SKILL FRAMEWORK:\n${skillMarkdown}\n\n---\n\nFOUNDER'S NOTION PAGE:\nTitle: ${pageTitle}\n\n${pageText}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  const coachingResponse = message.content[0].text;

  if (!dryRun) {
    await writeCoachingCallout(pageId, skillName, coachingResponse);
  }

  return { pageTitle, skillName, confidence, status: dryRun ? 'dry-run' : 'done' };
}

async function main() {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    console.error(chalk.red('Error: NOTION_DATABASE_ID is not set in your .env file'));
    process.exit(1);
  }

  console.log(chalk.bold.blue(`\n📓 Minimalist Founder OS — Batch Coaching${dryRun ? chalk.yellow(' [DRY RUN]') : ''}\n`));

  const spinner = ora('Fetching pages from Notion database...').start();
  let pages;
  try {
    pages = await getDatabasePages(databaseId);
    spinner.succeed(`Found ${pages.length} pages`);
  } catch (err) {
    spinner.fail('Failed to fetch database pages');
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const results = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const spinner2 = ora(`Processing page ${i + 1}/${pages.length}...`).start();
    try {
      const result = await coachPage(page, anthropic);
      results.push(result);
      spinner2.succeed(`${result.pageTitle} → ${result.skillName} (${(result.confidence * 100).toFixed(0)}%)`);
    } catch (err) {
      spinner2.fail(`Failed: ${page.id}`);
      results.push({ pageTitle: page.id, skillName: 'error', confidence: 0, status: 'failed' });
    }
  }

  const table = new Table({
    head: [chalk.bold('Page'), chalk.bold('Skill'), chalk.bold('Confidence'), chalk.bold('Status')],
    colWidths: [40, 25, 15, 12],
  });

  for (const r of results) {
    table.push([
      r.pageTitle.slice(0, 38),
      r.skillName,
      `${(r.confidence * 100).toFixed(0)}%`,
      r.status === 'done' ? chalk.green(r.status) : r.status === 'dry-run' ? chalk.yellow(r.status) : chalk.red(r.status),
    ]);
  }

  console.log('\n' + table.toString());
  console.log(chalk.bold.green(`\n✅ Batch complete: ${results.filter(r => r.status !== 'failed').length}/${results.length} pages processed.\n`));
}

main();
