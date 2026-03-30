import Anthropic from '@anthropic-ai/sdk';
import { getPageContent, getPageTitle, writeCoachingCallout } from './notion-utils.js';
import { routeSkill } from './skills-router.js';
import chalk from 'chalk';
import ora from 'ora';
import 'dotenv/config';

async function main() {
  const pageId = process.env.NOTION_PAGE_ID;
  if (!pageId) {
    console.error(chalk.red('Error: NOTION_PAGE_ID is not set in your .env file'));
    process.exit(1);
  }

  console.log(chalk.bold.blue('\n📓 Minimalist Founder OS — Notion MCP Coaching Agent\n'));

  // Step 1: Read the Notion page
  const spinner = ora('Reading your Notion page...').start();
  let pageText, pageTitle;
  try {
    [pageText, pageTitle] = await Promise.all([
      getPageContent(pageId),
      getPageTitle(pageId),
    ]);
    spinner.succeed(`Read page: "${pageTitle}"`);
  } catch (err) {
    spinner.fail('Failed to read Notion page');
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  // Step 2: Route to the right skill
  const spinner2 = ora('Detecting which skill applies...').start();
  const { skillName, skillMarkdown, confidence } = await routeSkill(pageText);
  spinner2.succeed(
    `Skill detected: ${chalk.bold(skillName)} (confidence: ${(confidence * 100).toFixed(0)}%)`
  );

  // Step 3: Call Claude with the skill + page content
  const spinner3 = ora('Generating AI coaching from Claude 3.5 Sonnet...').start();
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `You are a Minimalist Entrepreneur coach. You use ONLY the principles and frameworks from the provided SKILL document. Be direct, specific, and actionable.

The founder has shared a Notion page. Your job:
1. Give a brief honest assessment of where they are
2. Give the 3-5 most important next steps based on the skill framework
3. Call out any specific red flags or green flags you see in their notes
4. End with one key question for them to reflect on

Format your response in plain text with clear sections. Use ALL CAPS for section titles (displays well in Notion callouts).`;

  const userPrompt = `SKILL FRAMEWORK:\n${skillMarkdown}\n\n---\n\nFOUNDER'S NOTION PAGE:\nTitle: ${pageTitle}\n\n${pageText}`;

  let coachingResponse;
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    });
    coachingResponse = message.content[0].text;
    spinner3.succeed('Coaching generated!');
  } catch (err) {
    spinner3.fail('Claude API error');
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  // Step 4: Write back to Notion
  const spinner4 = ora('Writing coaching callout back to Notion...').start();
  try {
    await writeCoachingCallout(pageId, skillName, coachingResponse);
    spinner4.succeed('Coaching callout added to your Notion page!');
  } catch (err) {
    spinner4.fail('Failed to write to Notion');
    console.error(chalk.red(err.message));
    process.exit(1);
  }

  console.log(chalk.bold.green('\n✅ Done! Open your Notion page to see the coaching.\n'));
  console.log(chalk.gray('Skill applied:'), chalk.bold(skillName));
  console.log(chalk.gray('Page:'), chalk.underline(`https://notion.so/${pageId.replace(/-/g, '')}`));
  console.log();
}

main();