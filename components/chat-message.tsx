import type { ChatMessage as ChatMessageType } from '@/types/form-guide';
import AnnotatedImage from './annotated-image';
import AnnotationLegend from './annotation-legend';
import SensitiveWarning from './sensitive-warning';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps): JSX.Element {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl bg-brand-500 px-4 py-2 text-sm text-white shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }

  if (message.role === 'assistant') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <AnnotatedImage
          src={message.imageDataUrl}
          annotations={message.annotations}
        />
        <p className="text-sm text-slate-700">{message.explanation}</p>
        <AnnotationLegend annotations={message.annotations} />
      </div>
    );
  }

  if (message.role === 'system-warning') {
    return <SensitiveWarning detectedCategories={message.detectedCategories} />;
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
    >
      {message.message}
    </div>
  );
}
