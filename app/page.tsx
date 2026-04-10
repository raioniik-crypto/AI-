import ChatContainer from '@/components/chat-container';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          FormGuide
        </h1>
        <p className="text-sm text-slate-600">
          外国語サイトのフォームのスクリーンショットと入力したい内容を送ると、どの欄に何を入れるべきかを注釈画像で教えます。
        </p>
      </header>
      <ChatContainer />
    </main>
  );
}
