import { NextResponse } from 'next/server';
import { z } from 'zod';
import { detectSensitive } from '@/lib/security/sensitive-detector';
import {
  analyzeWithOpenAI,
  analyzeOperationWithOpenAI,
} from '@/lib/openai/client';
import type { AnalyzeResponse } from '@/types/form-guide';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  imageDataUrl: z
    .string()
    .refine((value) => value.startsWith('data:image/'), {
      message: 'imageDataUrl must be a data: URL with an image/ MIME type',
    }),
  userText: z.string().min(1, 'userText must not be empty'),
  guideMode: z.enum(['form', 'operation']).optional().default('form'),
  history: z
    .array(
      z.union([
        z.object({ role: z.literal('user'), text: z.string() }),
        z.object({ role: z.literal('assistant'), explanation: z.string() }),
      ]),
    )
    .max(20)
    .default([]),
});

function jsonResponse(payload: AnalyzeResponse, status: number): NextResponse {
  return NextResponse.json(payload, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, reason: 'invalid', message: 'リクエストボディが不正です' },
      400,
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        reason: 'invalid',
        message: parsed.error.issues[0]?.message ?? 'リクエスト形式が不正です',
      },
      400,
    );
  }

  const { imageDataUrl, userText, guideMode, history } = parsed.data;

  const sensitive = detectSensitive(userText);
  if (sensitive.hasSensitive) {
    return jsonResponse(
      {
        ok: false,
        reason: 'sensitive',
        detectedCategories: sensitive.categories,
      },
      400,
    );
  }

  try {
    if (guideMode === 'operation') {
      const { result, debug } = await analyzeOperationWithOpenAI({
        imageDataUrl,
        userText,
        history,
      });

      if (result.steps.length === 0 && result.unresolved.length === 0) {
        return jsonResponse(
          {
            ok: false,
            reason: 'no-target',
            message:
              result.summaryJa ||
              '操作対象が見つかりませんでした。別のスクリーンショットや質問でお試しください。',
          },
          200,
        );
      }

      const includeDebug = process.env.OPERATION_GUIDE_DEBUG === '1';
      return jsonResponse(
        {
          ok: true,
          mode: 'operation',
          result,
          ...(includeDebug ? { debug } : {}),
        },
        200,
      );
    }

    const result = await analyzeWithOpenAI({
      imageDataUrl,
      userText,
      history,
    });

    if (result.annotations.length === 0) {
      return jsonResponse(
        {
          ok: false,
          reason: 'no-form',
          message:
            result.explanation ||
            'フォーム要素が検出されませんでした。別のスクリーンショットをお試しください。',
        },
        200,
      );
    }

    return jsonResponse(
      {
        ok: true,
        mode: 'form',
        annotations: result.annotations,
        explanation: result.explanation,
      },
      200,
    );
  } catch (error) {
    const isTimeout =
      error instanceof Error && /timeout|timed out/i.test(error.message);
    return jsonResponse(
      {
        ok: false,
        reason: isTimeout ? 'timeout' : 'upstream',
        message: isTimeout
          ? 'AI 解析がタイムアウトしました。しばらくしてから再試行してください。'
          : 'AI 解析中にエラーが発生しました。時間をおいて再試行してください。',
      },
      isTimeout ? 504 : 502,
    );
  }
}
