'use client';

import { useEffect, useRef } from 'react';
import { useFormGuideStore } from '@/stores/form-guide-store';
import ChatMessage from './chat-message';
import LoadingIndicator from './loading-indicator';

export default function ChatThread(): JSX.Element {
  const messages = useFormGuideStore((state) => state.messages);
  const isAnalyzing = useFormGuideStore((state) => state.isAnalyzing);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isAnalyzing]);

  return (
    <div
      className="flex flex-col gap-3 overflow-y-auto"
      data-testid="chat-thread"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isAnalyzing ? <LoadingIndicator /> : null}
      <div ref={bottomRef} />
    </div>
  );
}
