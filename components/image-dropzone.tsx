'use client';

import { useRef } from 'react';
import { Upload, ClipboardPaste, ImagePlus } from 'lucide-react';
import { useImageIngest } from '@/hooks/use-image-ingest';
import ScreenshotGuideCard from './screenshot-guide-card';
import FutureOperationGuideNote from './future-operation-guide-note';

export default function ImageDropzone(): JSX.Element {
  const { isDragging, isProcessing, error, onDragOver, onDragLeave, onDrop, ingestFile } =
    useImageIngest();
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = (): void => {
    inputRef.current?.click();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      void ingestFile(file);
    }
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      <section
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-colors ${
          isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-300 bg-white'
        }`}
      >
        <ImagePlus className="h-10 w-10 text-slate-500" aria-hidden="true" />
        <p className="text-center text-sm text-slate-700">
          外国語フォームのスクリーンショットをここにドロップ、貼り付け (Ctrl/Cmd+V)、または選択してください。
        </p>
        <button
          type="button"
          onClick={handlePick}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {isProcessing ? '処理中...' : '画像を選択'}
        </button>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <ClipboardPaste className="h-3 w-3" aria-hidden="true" />
          クリップボード貼り付けにも対応
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleInputChange}
        />
        {error ? (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </section>
      <ScreenshotGuideCard />
      <FutureOperationGuideNote />
    </div>
  );
}
