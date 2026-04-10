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
    } else if (message.role === 'assistant-operation') {
      history.push({
        role: 'assistant',
        explanation: message.result.summaryJa,
      });
    }
  }
  return history;
}

const EMPTY_STRUCTURED: StructuredInput = {};

const OPERATION_PLACEHOLDER =
  '例: どこを押せば設定画面を開けますか？ / 保存ボタンはどれですか？';
const FORM_FREE_PLACEHOLDER =
  '例: 姓はYamaguchi、名はTamon、国はJapan、メールはtaro@example.com';

export default function ChatInput(): JSX.Element {
  const [inputMode, setInputMode] = useState<InputMode>('free');
  const [freeText, setFreeText] = useState('');
  const [structured, setStructured] = useState<StructuredInput>(EMPTY_STRUCTURED);

  const currentImage = useFormGuideStore((state) => state.currentImage);
  const messages = useFormGuideStore((state) => state.messages);
  const isAnalyzing = useFormGuideStore((state) => state.isAnalyzing);
  const guideMode = useFormGuideStore((state) => state.guideMode);
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

  // Structured-input sub-mode only applies to form guide. Operation
  // guide always uses a single free-text textarea.
  const effectiveInputMode: InputMode =
    guideMode === 'operation' ? 'free' : inputMode;

  const canSubmit = (() => {
    if (!currentImage || isAnalyzing) return false;
    if (effectiveInputMode === 'free') return freeText.trim().length > 0;
    return structuredFilledCount > 0 && !structuredHasErrors;
  })();

  const resetInputs = (): void => {
    setFreeText('');
    setStructured(EMPTY_STRUCTURED);
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!currentImage || isAnalyzing) return;

    let userText: string;
    if (effectiveInputMode === 'free') {
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
          guideMode,
          history: buildHistory(messages),
        } satisfies AnalyzeRequestBody),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (data.ok && data.mode === 'form') {
        appendMessage({
          id: createId(),
          role: 'assistant',
          imageDataUrl: currentImage.dataUrl,
          annotations: data.annotations,
          explanation: data.explanation,
        });
      } else if (data.ok && data.mode === 'operation') {
        appendMessage({
          id: createId(),
          role: 'assistant-operation',
          imageDataUrl: currentImage.dataUrl,
          result: data.result,
        });
      } else if (!data.ok && data.reason === 'sensitive') {
        appendMessage({
          id: createId(),
          role: 'system-warning',
          detectedCategories: data.detectedCategories,
        });
      } else if (!data.ok) {
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

  const placeholder =
    guideMode === 'operation' ? OPERATION_PLACEHOLDER : FORM_FREE_PLACEHOLDER;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {guideMode === 'form' ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <InputModeToggle
            mode={inputMode}
            onChange={setInputMode}
            disabled={isAnalyzing}
          />
          <p className="text-[11px] text-slate-500">
            {inputMode === 'free'
              ? '自由に書けます'
              : '欄ごとに分けると意味解釈がブレにくくなります'}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500">
          画面のどこを押せばよいか日本語で質問してください。操作は自動実行されません。
        </p>
      )}

      {effectiveInputMode === 'free' ? (
        <div className="flex flex-col gap-1">
          <label
            htmlFor="user-text"
            className="text-xs font-medium text-slate-600"
          >
            {guideMode === 'operation' ? '質問・目的' : '入力したい内容'}
          </label>
          <textarea
            id="user-text"
            value={freeText}
            onChange={(event) => setFreeText(event.target.value)}
            rows={3}
            placeholder={placeholder}
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
        {guideMode === 'form' && effectiveInputMode === 'structured' ? (
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
