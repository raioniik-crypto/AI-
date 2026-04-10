'use client';

import { useCallback, useEffect, useState } from 'react';
import { resizeImageFileToDataUrl } from '@/lib/image/resize';
import { useFormGuideStore } from '@/stores/form-guide-store';

interface UseImageIngestResult {
  isDragging: boolean;
  isProcessing: boolean;
  error: string | null;
  onDragOver: (event: React.DragEvent<HTMLElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLElement>) => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
  ingestFile: (file: File) => Promise<void>;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024;

/**
 * Provides file-drop, file-picker, and clipboard-paste ingest for
 * screenshots. Results are pushed into `useFormGuideStore.setCurrentImage`.
 */
export function useImageIngest(): UseImageIngestResult {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentImage = useFormGuideStore((state) => state.setCurrentImage);

  const ingestFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください。');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError('画像サイズが大きすぎます (最大 15MB)。');
        return;
      }
      setIsProcessing(true);
      try {
        const { dataUrl, width, height } = await resizeImageFileToDataUrl(file);
        setCurrentImage({ dataUrl, width, height });
      } catch {
        setError('画像の読み込みに失敗しました。');
      } finally {
        setIsProcessing(false);
      }
    },
    [setCurrentImage],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) {
        void ingestFile(file);
      }
    },
    [ingestFile],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent): void => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item && item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void ingestFile(file);
            return;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [ingestFile]);

  return {
    isDragging,
    isProcessing,
    error,
    onDragOver,
    onDragLeave,
    onDrop,
    ingestFile,
  };
}
