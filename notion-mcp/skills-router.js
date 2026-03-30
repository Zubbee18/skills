import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SKILL_KEYWORDS = {
  'validate-idea': ['validate', 'idea', 'problem', 'customer', 'pain', 'market', 'research', 'hypothesis'],
  'mvp': ['mvp', 'build', 'prototype', 'launch', 'product', 'feature', 'ship', 'iteration'],
  'first-customers': ['customers', 'users', 'sales', 'outreach', 'convert', 'acquisition', 'leads', 'pipeline'],
  'find-community': ['community', 'audience', 'followers', 'twitter', 'newsletter', 'network', 'engagement'],
  'marketing-plan': ['marketing', 'content', 'seo', 'ads', 'growth', 'brand', 'social', 'traffic'],
  'pricing': ['pricing', 'price', 'charge', 'revenue', 'monetize', 'subscription', 'tiers', 'pay'],
  'grow-sustainably': ['scale', 'grow', 'hiring', 'team', 'operations', 'sustainable', 'profit', 'expand'],
  'processize': ['process', 'systems', 'automate', 'delegate', 'workflow', 'efficiency', 'sop', 'tools'],
  'company-values': ['values', 'culture', 'mission', 'vision', 'team', 'principles', 'hiring', 'ethics'],
  'minimalist-review': ['review', 'reflect', 'assess', 'retrospective', 'check', 'audit', 'evaluate', 'metrics'],
};

/**
 * Routes a page's text to the best matching skill.
 * Returns { skillName, skillMarkdown, confidence }
 */
export async function routeSkill(pageText) {
  const lowerText = pageText.toLowerCase();
  const scores = {};

  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\b${keyword}\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length;
    }
    scores[skill] = score;
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const bestSkill = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const [skillName, skillScore] = bestSkill;
  const confidence = skillScore / totalScore;

  // Read the skill markdown file
  const skillPath = resolve(__dirname, `../skills/${skillName}/SKILL.md`);
  let skillMarkdown;
  try {
    skillMarkdown = readFileSync(skillPath, 'utf-8');
  } catch {
    skillMarkdown = `# ${skillName}\n\nNo SKILL.md found for this skill.`;
  }

  return { skillName, skillMarkdown, confidence };
}