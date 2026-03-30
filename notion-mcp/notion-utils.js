import { Client } from '@notionhq/client';
import 'dotenv/config';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * Recursively reads all blocks from a Notion page and returns plain text.
 */
export async function getPageContent(pageId) {
  const blocks = await getAllBlocks(pageId);
  return blocksToText(blocks);
}

async function getAllBlocks(blockId) {
  const blocks = [];
  let cursor;
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of response.results) {
      blocks.push(block);
      if (block.has_children) {
        block.children = await getAllBlocks(block.id);
      }
    }
    cursor = response.next_cursor;
  } while (cursor);
  return blocks;
}

function extractRichText(richTextArr) {
  if (!richTextArr || richTextArr.length === 0) return '';
  return richTextArr.map((t) => t.plain_text).join('');
}

function blocksToText(blocks, indent = '') {
  const lines = [];
  for (const block of blocks) {
    const type = block.type;
    const data = block[type];
    let text = '';

    if (data?.rich_text) {
      text = extractRichText(data.rich_text);
    }

    switch (type) {
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        lines.push(`\n${indent}${text}\n`);
        break;
      case 'bulleted_list_item':
      case 'numbered_list_item':
      case 'to_do':
        lines.push(`${indent}- ${text}`);
        break;
      case 'paragraph':
        if (text) lines.push(`${indent}${text}`);
        break;
      case 'code':
        lines.push(`${indent}[code: ${text}]`);
        break;
      case 'quote':
        lines.push(`${indent}> ${text}`);
        break;
      default:
        if (text) lines.push(`${indent}${text}`);
    }

    if (block.children && block.children.length > 0) {
      lines.push(blocksToText(block.children, indent + '  '));
    }
  }
  return lines.join('\n');
}

/**
 * Returns the title of a Notion page.
 */
export async function getPageTitle(pageId) {
  const page = await notion.pages.retrieve({ page_id: pageId });
  const titleProp = Object.values(page.properties).find(
    (p) => p.type === 'title'
  );
  if (!titleProp) return 'Untitled';
  return extractRichText(titleProp.title) || 'Untitled';
}

/**
 * Appends a styled coaching callout block to a Notion page.
 * Splits long text into multiple paragraph children (Notion has a 2000 char limit per block).
 */
export async function writeCoachingCallout(pageId, skillName, coachingText) {
  const CHUNK_SIZE = 1900;
  const chunks = [];
  for (let i = 0; i < coachingText.length; i += CHUNK_SIZE) {
    chunks.push(coachingText.slice(i, i + CHUNK_SIZE));
  }

  const children = chunks.map((chunk) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: chunk } }],
    },
  }));

  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: 'block',
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '🔍' },
          color: 'blue_background',
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Minimalist Founder OS — ${skillName} Coaching`,
              },
              annotations: { bold: true },
            },
          ],
          children,
        },
      },
    ],
  });
}