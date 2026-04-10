'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useFormGuideStore } from '@/stores/form-guide-store';
import type {
  AnalyzeRequestBody,
  AnalyzeResponse,
  ChatMessage,
} from '@/types/form-guide';

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

export default function ChatInput(): JSX.Element {
  const [text, setText] = useState('');
  const currentImage = useFormGuideStore((state) => state.currentImage);
  const messages = useFormGuideStore((state) => state.messages);
  const isAnalyzing = useFormGuideStore((state) => state.isAnalyzing);
  const appendMessage = useFormGuideStore((state) => state.appendMessage);
  const setAnalyzing = useFormGuideStore((state) => state.setAnalyzing);

  const canSubmit = Boolean(currentImage) && text.trim().length > 0 && !isAnalyzing;

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!currentImage || !text.trim() || isAnalyzing) return;

    const userText = text.trim();
    appendMessage({ id: createId(), role: 'user', text: userText });
    setText('');
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="user-text" className="text-xs font-medium text-slate-600">
        入力したい内容
      </label>
      <textarea
        id="user-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        placeholder="例: 名前は山田太郎、メールは taro@example.com、国は Japan"
        className="resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        disabled={isAnalyzing}
      />
      <div className="flex justify-end">
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
