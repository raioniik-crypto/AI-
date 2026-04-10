import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FormGuide — 外国語フォーム入力ガイド',
  description:
    'スクリーンショットと入力したい内容を送ると、外国語フォームのどこに何を入れるべきかを注釈画像で教えてくれるツール。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
