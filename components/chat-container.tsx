'use client';

import { RotateCcw } from 'lucide-react';
import { useFormGuideStore } from '@/stores/form-guide-store';
import ImageDropzone from './image-dropzone';
import ChatThread from './chat-thread';
import ChatInput from './chat-input';
import ScreenshotGuideCard from './screenshot-guide-card';
import GuideModeToggle from './guide-mode-toggle';

export default function ChatContainer(): JSX.Element {
  const currentImage = useFormGuideStore((state) => state.currentImage);
  const guideMode = useFormGuideStore((state) => state.guideMode);
  const setGuideMode = useFormGuideStore((state) => state.setGuideMode);
  const isAnalyzing = useFormGuideStore((state) => state.isAnalyzing);
  const reset = useFormGuideStore((state) => state.reset);

  if (!currentImage) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <GuideModeToggle mode={guideMode} onChange={setGuideMode} />
          <p className="text-[11px] text-slate-500">
            {guideMode === 'form'
              ? 'フォームの入力欄をガイド'
              : '画面の操作対象を案内 (beta)'}
          </p>
        </div>
        <ImageDropzone />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <GuideModeToggle
          mode={guideMode}
          onChange={setGuideMode}
          disabled={isAnalyzing}
        />
        <div className="flex items-center gap-2">
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
      </div>
      <ScreenshotGuideCard />
      <ChatThread />
      <ChatInput />
    </div>
  );
}
