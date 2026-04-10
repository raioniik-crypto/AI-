import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnnotationLegend from './annotation-legend';
import type { Annotation } from '@/types/form-guide';

const annotations: Annotation[] = [
  {
    id: 1,
    label: 'Name',
    value: '山田太郎',
    note: '姓名まとめて',
    bbox: { x: 0.1, y: 0.1, w: 0.2, h: 0.05 },
  },
  {
    id: 2,
    label: 'Email',
    value: 'taro@example.com',
    note: '',
    bbox: null,
  },
];

describe('<AnnotationLegend />', () => {
  it('renders the label, value, and note for each annotation', () => {
    render(<AnnotationLegend annotations={annotations} />);
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText(/姓名まとめて/)).toBeInTheDocument();
    expect(screen.getByText(/taro@example\.com/)).toBeInTheDocument();
  });

  it('separates annotations without bbox into an "unspecified" section', () => {
    render(<AnnotationLegend annotations={annotations} />);
    expect(screen.getByText(/未特定/)).toBeInTheDocument();
  });

  it('renders an empty state when there are no annotations', () => {
    render(<AnnotationLegend annotations={[]} />);
    expect(screen.getByText(/解析結果はありません/)).toBeInTheDocument();
  });
});
