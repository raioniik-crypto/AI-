import 'server-only';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { AnalyzeRequestBody } from '@/types/form-guide';
import type { OperationGuideResult } from '@/types/operation-guide';
import { SYSTEM_PROMPT } from './prompts';
import { OPERATION_GUIDE_SYSTEM_PROMPT } from './operation-prompts';
import {
  ANALYZE_JSON_SCHEMA,
  AnalyzeResultSchema,
  clampAnnotations,
  type ValidatedAnalyzeResult,
} from './schema';
import {
  OPERATION_GUIDE_JSON_SCHEMA,
  OperationGuideResultSchema,
  sanitizeOperationGuideResult,
} from './operation-schema';

const ANALYZE_MODEL = 'gpt-4o';
const REQUEST_TIMEOUT_MS = 30_000;

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  cachedClient = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS });
  return cachedClient;
}

function buildVisionMessages(
  systemPrompt: string,
  body: AnalyzeRequestBody,
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];
  for (const entry of body.history) {
    if (entry.role === 'user') {
      messages.push({ role: 'user', content: entry.text });
    } else {
      messages.push({ role: 'assistant', content: entry.explanation });
    }
  }
  messages.push({
    role: 'user',
    content: [
      { type: 'text', text: body.userText },
      {
        type: 'image_url',
        image_url: { url: body.imageDataUrl, detail: 'high' },
      },
    ],
  });
  return messages;
}

/**
 * Calls GPT-4o Vision with the given screenshot and user text, and returns
 * a validated, bbox-clamped AnalyzeResult. Throws on network/upstream errors.
 */
export async function analyzeWithOpenAI(
  body: AnalyzeRequestBody,
): Promise<ValidatedAnalyzeResult> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: ANALYZE_MODEL,
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'FormGuideAnalyzeResult',
        strict: true,
        schema: ANALYZE_JSON_SCHEMA,
      },
    },
    messages: buildVisionMessages(SYSTEM_PROMPT, body),
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error('OpenAI returned an empty response');
  }

  const parsed = AnalyzeResultSchema.parse(JSON.parse(rawContent));
  return clampAnnotations(parsed);
}

/**
 * Calls GPT-4o Vision in 画面操作ガイド mode. Reuses the same request shape
 * (image + userText + history) but asks for an OperationGuideResult via a
 * separate prompt + JSON schema.
 */
export async function analyzeOperationWithOpenAI(
  body: AnalyzeRequestBody,
): Promise<OperationGuideResult> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: ANALYZE_MODEL,
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'OperationGuideResult',
        strict: true,
        schema: OPERATION_GUIDE_JSON_SCHEMA,
      },
    },
    messages: buildVisionMessages(OPERATION_GUIDE_SYSTEM_PROMPT, body),
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) {
    throw new Error('OpenAI returned an empty response');
  }

  const parsed = OperationGuideResultSchema.parse(JSON.parse(rawContent));
  return sanitizeOperationGuideResult(parsed);
}
