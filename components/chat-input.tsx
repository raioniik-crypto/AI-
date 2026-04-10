'use client';

import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { useFormGuideStore } from '@/stores/form-guide-store';
import {
  buildCanonicalInstructionText,
  collectFilledFields,
  type StructuredInput,
} from '@/lib/structured-input/canonical';
import { validateStructuredInput } from '@/lib/structured-input/validation';
import type {
  AnalyzeRequestBody,
  AnalyzeResponse,
  ChatMessage,
} from '@/types/form-guide';
import InputModeToggle, { type InputMode } from './input-mode-toggle';
import StructuredInputForm from './structured-input-form';

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildHistory(messages: ChatMessage[]): AnalyzeRequestBody['history'] {
  const history: AnalyzeRequestBody['history'] = [];
  for (const message of messages) {
    if (message.role === 'user') {
      history.push({ role: 'user', text: message.text });
    } else if (message.role === 'assistant') {
      history.push({ role: 'assistant', explanation: message.explanation });
    }
  }
  return history;
}

const EMPTY_STRUCTURED: StructuredInput = {};

export default function ChatInput(): JSX.Element {
  const [mode, setMode] = useState<InputMode>('free');
  const [freeText, setFreeText] = useState('');
  const [structured, setStructured] = useState<StructuredInput>(EMPTY_STRUCTURED);

  const currentImage = useFormGuideStore((state) => state.currentImage);
  const messages = useFormGuideStore((state) => state.messages);
  const isAnalyzing = useFormGuideStore((state) => state.isAnalyzing);
  const appendMessage = useFormGuideStore((state) => state.appendMessage);
  const setAnalyzing = useFormGuideStore((state) => state.setAnalyzing);

  const structuredErrors = useMemo(
    () => validateStructuredInput(structured),
    [structured],
  );
  const structuredHasErrors = Object.keys(structuredErrors).length > 0;
  const structuredFilledCount = useMemo(
    () => collectFilledFields(structured).length,
    [structured],
  );

  const canSubmit = (() => {
    if (!currentImage || isAnalyzing) return false;
    if (mode === 'free') return freeText.trim().length > 0;
    return structuredFilledCount > 0 && !structuredHasErrors;
  })();

  const resetInputs = (): void => {
    setFreeText('');
    setStructured(EMPTY_STRUCTURED);
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!currentImage || isAnalyzing) return;

    // Compute the payload text depending on which mode is active. Both
    // modes produce a plain string so the existing /api/analyze endpoint
    // doesn't need any changes — structured input is just free text with
    // a more regular shape.
    let userText: string;
    if (mode === 'free') {
      userText = freeText.trim();
      if (!userText) return;
    } else {
      if (structuredHasErrors || structuredFilledCount === 0) return;
      userText = buildCanonicalInstructionText(structured);
      if (!userText) return;
    }

    appendMessage({ id: createId(), role: 'user', text: userText });
    resetInputs();
    setAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: currentImage.dataUrl,
          userText,
          history: buildHistory(messages),
        } satisfies AnalyzeRequestBody),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (data.ok) {
        appendMessage({
          id: createId(),
          role: 'assistant',
          imageDataUrl: currentImage.dataUrl,
          annotations: data.annotations,
          explanation: data.explanation,
        });
      } else if (data.reason === 'sensitive') {
        appendMessage({
          id: createId(),
          role: 'system-warning',
          detectedCategories: data.detectedCategories,
        });
      } else {
        appendMessage({
          id: createId(),
          role: 'system-error',
          message: data.message,
        });
      }
    } catch {
      appendMessage({
        id: createId(),
        role: 'system-error',
        message: '通信エラーが発生しました。ネットワークを確認して再試行してください。',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <InputModeToggle mode={mode} onChange={setMode} disabled={isAnalyzing} />
        <p className="text-[11px] text-slate-500">
          {mode === 'free'
            ? '自由に書けます'
            : '欄ごとに分けると意味解釈がブレにくくなります'}
        </p>
      </div>

      {mode === 'free' ? (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="user-text"
            className="text-xs font-medium text-slate-600"
          >
            入力したい内容
          </label>
          <textarea
            id="user-text"
            value={freeText}
            onChange={(event) => setFreeText(event.target.value)}
            rows={3}
            placeholder="例: 姓はYamaguchi、名はTamon、国はJapan、メールはtaro@example.com"
            className="resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            disabled={isAnalyzing}
          />
        </div>
      ) : (
        <StructuredInputForm
          value={structured}
          onChange={setStructured}
          errors={structuredErrors}
          disabled={isAnalyzing}
        />
      )}

      <div className="flex items-center justify-end gap-3">
        {mode === 'structured' ? (
          <p className="text-[11px] text-slate-500">
            {structuredFilledCount > 0
              ? `${structuredFilledCount} 項目を送信`
              : '項目を1つ以上入力してください'}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          送信
        </button>
      </div>
    </form>
  );
}
