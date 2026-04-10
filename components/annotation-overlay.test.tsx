import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AnnotationOverlay from './annotation-overlay';
import type { Annotation } from '@/types/form-guide';

const annotations: Annotation[] = [
  {
    id: 1,
    label: 'Name',
    value: 'Taro',
    note: '',
    bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.05 },
  },
  {
    id: 2,
    label: 'Email',
    value: 'taro@example.com',
    note: '',
    bbox: null,
  },
  {
    id: 3,
    label: 'Phone',
    value: '000-0000',
    note: '',
    bbox: { x: 0.4, y: 0.4, w: 0.3, h: 0.05 },
  },
];

describe('<AnnotationOverlay />', () => {
  it('renders a <svg> with matching viewBox, width/height, and preserveAspectRatio="none"', () => {
    const { container } = render(
      <AnnotationOverlay width={1000} height={500} annotations={annotations} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    // All four must agree for 1 SVG unit to equal 1 CSS pixel — if they
    // drift apart, letterboxing re-introduces the rightward bbox shift.
    expect(svg?.getAttribute('viewBox')).toBe('0 0 1000 500');
    expect(svg?.getAttribute('width')).toBe('1000');
    expect(svg?.getAttribute('height')).toBe('500');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('none');
  });

  it('aligns bbox rect coordinates exactly with the normalized bbox × render size', () => {
    const { container } = render(
      <AnnotationOverlay width={1000} height={500} annotations={annotations} />,
    );
    const rect = container.querySelector('rect[data-annotation]');
    expect(rect).not.toBeNull();
    // annotation 1: x=0.1 y=0.2 w=0.3 h=0.05 at 1000x500
    expect(rect?.getAttribute('x')).toBe('100');
    expect(rect?.getAttribute('y')).toBe('100');
    expect(rect?.getAttribute('width')).toBe('300');
    expect(rect?.getAttribute('height')).toBe('25');
  });

  it('skips annotations with null bbox', () => {
    const { container } = render(
      <AnnotationOverlay width={1000} height={500} annotations={annotations} />,
    );
    const rects = container.querySelectorAll('rect[data-annotation]');
    expect(rects.length).toBe(2);
  });

  it('renders numbered badges matching the annotation ids', () => {
    const { getByText } = render(
      <AnnotationOverlay width={1000} height={500} annotations={annotations} />,
    );
    expect(getByText('1')).toBeInTheDocument();
    expect(getByText('3')).toBeInTheDocument();
  });

  it('renders nothing when there are no annotations', () => {
    const { container } = render(
      <AnnotationOverlay width={800} height={600} annotations={[]} />,
    );
    const rects = container.querySelectorAll('rect[data-annotation]');
    expect(rects.length).toBe(0);
  });
});
