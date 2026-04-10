import { describe, it, expect, beforeEach } from 'vitest';
import { useFormGuideStore } from './form-guide-store';
import type { Annotation } from '@/types/form-guide';

const sampleAnnotation: Annotation = {
  id: 1,
  label: 'Name',
  value: 'Taro',
  note: '',
  bbox: { x: 0.1, y: 0.1, w: 0.2, h: 0.05 },
};

describe('useFormGuideStore', () => {
  beforeEach(() => {
    useFormGuideStore.getState().reset();
  });

  it('has a clean initial state', () => {
    const state = useFormGuideStore.getState();
    expect(state.currentImage).toBeNull();
    expect(state.messages).toEqual([]);
    expect(state.isAnalyzing).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets the current image and clears previous messages', () => {
    const { setCurrentImage, appendMessage } = useFormGuideStore.getState();
    appendMessage({ id: 'u1', role: 'user', text: 'hello' });
    setCurrentImage({ dataUrl: 'data:image/png;base64,AAA', width: 800, height: 600 });

    const state = useFormGuideStore.getState();
    expect(state.currentImage).toEqual({
      dataUrl: 'data:image/png;base64,AAA',
      width: 800,
      height: 600,
    });
    expect(state.messages).toEqual([]);
  });

  it('appends user and assistant messages in order', () => {
    const { appendMessage } = useFormGuideStore.getState();
    appendMessage({ id: 'u1', role: 'user', text: '名前は太郎' });
    appendMessage({
      id: 'a1',
      role: 'assistant',
      imageDataUrl: 'data:image/png;base64,AAA',
      annotations: [sampleAnnotation],
      explanation: 'Nameに太郎を入れます',
    });

    const { messages } = useFormGuideStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[0]?.role).toBe('user');
    expect(messages[1]?.role).toBe('assistant');
  });

  it('toggles the analyzing flag', () => {
    const { setAnalyzing } = useFormGuideStore.getState();
    setAnalyzing(true);
    expect(useFormGuideStore.getState().isAnalyzing).toBe(true);
    setAnalyzing(false);
    expect(useFormGuideStore.getState().isAnalyzing).toBe(false);
  });

  it('stores and clears error messages', () => {
    const { setError } = useFormGuideStore.getState();
    setError('boom');
    expect(useFormGuideStore.getState().error).toBe('boom');
    setError(null);
    expect(useFormGuideStore.getState().error).toBeNull();
  });

  it('reset restores the clean state', () => {
    const { setCurrentImage, appendMessage, setAnalyzing, reset } =
      useFormGuideStore.getState();
    setCurrentImage({ dataUrl: 'data:image/png;base64,AAA', width: 100, height: 100 });
    appendMessage({ id: 'u1', role: 'user', text: 'hi' });
    setAnalyzing(true);

    reset();

    const state = useFormGuideStore.getState();
    expect(state.currentImage).toBeNull();
    expect(state.messages).toEqual([]);
    expect(state.isAnalyzing).toBe(false);
  });
});
