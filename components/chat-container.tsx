'use client';

import { RotateCcw } from 'lucide-react';
import { useFormGuideStore } from '@/stores/form-guide-store';
import ImageDropzone from './image-dropzone';
import ChatThread from './chat-thread';
import ChatInput from './chat-input';
import ScreenshotGuideCard from './screenshot-guide-card';

export default function ChatContainer(): JSX.Element {
  const currentImage = useFormGuideStore((state) => state.currentImage);
  const reset = useFormGuideStore((state) => state.reset);

  if (!currentImage) {
    return <ImageDropzone />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          画像サイズ: {currentImage.width} × {currentImage.height} px
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-3 w-3" aria-hidden="true" />
          別の画像で始める
        </button>
      </div>
      <ScreenshotGuideCard />
      <ChatThread />
      <ChatInput />
    </div>
  );
}
