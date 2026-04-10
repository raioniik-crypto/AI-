## 影響範囲

現時点のリポジトリには `README.md` と `SPEC.md` しか存在せず、Next.js スキャフォールドも未構築。したがって影響範囲は「新規作成」が中心で、既存ファイルへの変更はない。

### プロジェクト基盤（新規）
- `package.json` — 依存関係とスクリプト定義（next, react, typescript, tailwindcss, zustand, framer-motion, lucide-react, openai, zod, vitest, @playwright/test, @testing-library/react, jsdom, @types/*）
- `tsconfig.json` — TypeScript strict mode 設定
- `next.config.mjs` — Next.js 14 App Router 設定
- `tailwind.config.ts` — Tailwind CSS 設定
- `postcss.config.mjs` — PostCSS 設定
- `.eslintrc.json` — ESLint 設定（`no-console` 警告、`no-explicit-any` エラー）
- `vitest.config.ts` — Vitest 設定（jsdom environment）
- `playwright.config.ts` — Playwright 設定
- `.env.local.example` — `OPENAI_API_KEY` のテンプレート
- `.gitignore` — `.next/`, `node_modules/`, `.env.local` 等の除外

### アプリ本体（新規）
- `app/layout.tsx` — ルートレイアウト（日本語 lang, フォント, globals.css 読込）
- `app/globals.css` — Tailwind ディレクティブ
- `app/page.tsx` — メインページ（Server Component、`ChatContainer` を client で読み込む）
- `app/api/analyze/route.ts` — POST ハンドラ（機密検出→OpenAI 呼出→JSON 返却）

### 型定義・ユーティリティ（新規）
- `types/form-guide.ts` — 共有型（`BBox`, `Annotation`, `AnalyzeRequest`, `AnalyzeResponse`, `ChatMessage`, `SensitiveDetectionResult`）
- `lib/security/sensitive-detector.ts` — 機密情報検出
- `lib/openai/client.ts` — OpenAI クライアント（server-only）
- `lib/openai/prompts.ts` — システムプロンプト
- `lib/openai/schema.ts` — zod による構造化出力スキーマ
- `lib/image/resize.ts` — クライアント側画像リサイズユーティリティ

### 状態管理・hooks（新規）
- `stores/form-guide-store.ts` — Zustand ストア
- `hooks/use-image-ingest.ts` — ファイル選択・D&D・クリップボード貼付の統合 hook

### コンポーネント（新規）
- `components/chat-container.tsx` — 画面全体のクライアント側ラッパー
- `components/image-dropzone.tsx` — 画像投入 UI
- `components/annotated-image.tsx` — 画像＋SVGオーバーレイ
- `components/annotation-overlay.tsx` — SVG 矢印・番号・ハイライト描画
- `components/annotation-legend.tsx` — 番号付き説明リスト
- `components/chat-thread.tsx` — スクロール可能な会話スレッド
- `components/chat-message.tsx` — 1 メッセージの表示
- `components/chat-input.tsx` — テキスト入力＋送信
- `components/sensitive-warning.tsx` — 機密検出時の警告バナー
- `components/loading-indicator.tsx` — 解析中のスピナー

### テスト（新規）
- `lib/security/sensitive-detector.test.ts` — Vitest
- `lib/image/resize.test.ts` — Vitest
- `components/annotation-overlay.test.tsx` — Vitest + RTL
- `components/annotation-legend.test.tsx` — Vitest + RTL
- `stores/form-guide-store.test.ts` — Vitest
- `e2e/paste-and-analyze.spec.ts` — Playwright E2E（OpenAI 呼出はモック）

---

## コンポーネント設計

### ChatContainer (`components/chat-container.tsx`)
- **責務**: ページ全体のクライアント側ルート。ストアを購読し、画像未投入時は `ImageDropzone`、投入後は `ChatThread` + `AnnotatedImage` + `ChatInput` をレイアウトする
- **Props**: なし
- **状態管理**: Zustand `useFormGuideStore`
- **"use client"**: 必要

### ImageDropzone (`components/image-dropzone.tsx`)
- **責務**: ファイル選択ダイアログ・ドラッグ&ドロップ・クリップボード貼付の 3 経路で画像を受け取り、ストアに `setCurrentImage` する
- **Props**: `{ onImageIngested: (dataUrl: string, width: number, height: number) => void }`
- **状態管理**: local state（`isDragging`）。`useImageIngest` hook を利用
- **"use client"**: 必要（DOM イベント・Clipboard API）

### AnnotatedImage (`components/annotated-image.tsx`)
- **責務**: 元画像 `<img>` を描画し、その上に `AnnotationOverlay` を絶対配置で重ねる。画像の実寸 (naturalWidth/Height) を取得して子に伝える
- **Props**: `{ src: string; annotations: Annotation[] }`
- **状態管理**: local state（`{ width: number; height: number } | null`）
- **"use client"**: 必要（`onLoad` で寸法取得）

### AnnotationOverlay (`components/annotation-overlay.tsx`)
- **責務**: 画像寸法に合わせた `viewBox` の `<svg>` を描画し、各 `Annotation` について半透明ハイライト矩形・番号バッジ・矢印を描く。bbox が範囲外の場合はクリップして描画スキップ
- **Props**: `{ width: number; height: number; annotations: Annotation[] }`
- **状態管理**: なし（pure）
- **"use client"**: 不要（Server Component として描画可）

### AnnotationLegend (`components/annotation-legend.tsx`)
- **責務**: 番号付きリスト `①Name 欄 → 山田太郎（姓名まとめて）` を表示。`bbox` が欠落した項目は末尾に「未特定」セクションで表示
- **Props**: `{ annotations: Annotation[] }`
- **状態管理**: なし
- **"use client"**: 不要

### ChatThread (`components/chat-thread.tsx`)
- **責務**: ストアから `messages` を取得して順に `ChatMessage` をレンダ。末尾に自動スクロール
- **Props**: なし
- **状態管理**: Zustand 購読 + local `useRef` for scroll
- **"use client"**: 必要

### ChatMessage (`components/chat-message.tsx`)
- **責務**: 1 件のメッセージを表示。`role === 'user'` ならテキスト、`role === 'assistant'` なら `AnnotatedImage` + `AnnotationLegend`、`role === 'system-warning'` なら `SensitiveWarning`
- **Props**: `{ message: ChatMessage }`
- **状態管理**: なし
- **"use client"**: 不要（子が必要に応じて）

### ChatInput (`components/chat-input.tsx`)
- **責務**: 自由記述テキスト `<textarea>` と送信ボタン。送信時に現在画像＋テキスト＋過去文脈を `/api/analyze` に POST し、結果をストアに append
- **Props**: なし
- **状態管理**: local state（入力中テキスト、送信中フラグ）+ Zustand
- **"use client"**: 必要

### SensitiveWarning (`components/sensitive-warning.tsx`)
- **責務**: 検出された機密項目名のリストを表示し、「入力内容を修正してください」と促す赤いバナー
- **Props**: `{ detectedCategories: string[] }`
- **状態管理**: なし
- **"use client"**: 不要

### LoadingIndicator (`components/loading-indicator.tsx`)
- **責務**: 解析中のスピナーと「AI が解析中です…」の表示。Framer Motion で fade-in
- **Props**: なし
- **状態管理**: なし
- **"use client"**: 必要（Framer Motion）

---

## データフロー

### 永続化レイヤー
本プロジェクトに Supabase 等のデータベースは**存在しない**。サーバー側はステートレスで、画像もレスポンス返却後に破棄する。ファイルシステム・DB・キャッシュへの書き込みは一切行わない。

### Zustand ストア (`stores/form-guide-store.ts`)

```ts
// 疑似コード、実装は実装フェーズで書く
interface FormGuideStore {
  currentImage: { dataUrl: string; width: number; height: number } | null;
  messages: ChatMessage[];
  isAnalyzing: boolean;
  error: string | null;

  setCurrentImage: (img: { dataUrl: string; width: number; height: number }) => void;
  clearCurrentImage: () => void;
  appendMessage: (msg: ChatMessage) => void;
  setAnalyzing: (flag: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}
```

**変更ルール**:
- 新しい画像を投入したら `messages` をリセットし、`currentImage` を更新
- 機密検出エラーは `messages` に `role: 'system-warning'` として append（履歴に残す）
- `isAnalyzing` は `ChatInput` 送信時に true、レスポンス受領 or エラーで false

### API フロー（`app/api/analyze/route.ts`）

```
[Client] ChatInput
  │ POST /api/analyze
  │ body: { imageDataUrl, userText, history: ChatMessage[] }
  ▼
[Server] route.ts
  │ 1. zod で body をバリデート
  │ 2. sensitive-detector.detect(userText)
  │    → 検出時: 400 { error: 'sensitive', categories: string[] } を返却し即 return
  │ 3. OpenAI GPT-4o Vision 呼出
  │    - model: 'gpt-4o'
  │    - messages: [systemPrompt, ...history, { role: 'user', content: [text, image] }]
  │    - response_format: zodToJsonSchema(AnalyzeResponseSchema)
  │ 4. レスポンスの bbox を 0-1 にクランプ
  │ 5. 200 { annotations: Annotation[], explanation: string } を返却
  │ 6. 画像 base64 はリクエストスコープ変数のみで保持、関数終了でGC
  ▼
[Client]
  │ レスポンスをストアに append
  │ ChatThread が再レンダ → AnnotatedImage + AnnotationLegend 表示
```

### 型定義の骨子 (`types/form-guide.ts`)

```ts
// 疑似コード、実装フェーズで厳密化する
export interface BBox {
  x: number; // 0-1 normalized
  y: number;
  w: number;
  h: number;
}

export interface Annotation {
  id: number;       // 1-indexed
  label: string;    // 「Name 欄」
  value: string;    // 「山田太郎」
  note: string;     // 「姓名まとめて入力」
  bbox: BBox | null;
}

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; annotations: Annotation[]; explanation: string; imageDataUrl: string }
  | { id: string; role: 'system-warning'; detectedCategories: string[] };

export interface AnalyzeRequest {
  imageDataUrl: string;
  userText: string;
  history: ChatMessage[];
}

export interface AnalyzeResponse {
  annotations: Annotation[];
  explanation: string;
}
```

---

## 実装ステップ（この順序で進めること）

各ステップは 1〜2 ファイルの変更を原則とする。ステップ 1〜3 はスキャフォールドのため複数ファイルにまたがるが、論理的に不可分なためまとめて 1 ステップ扱い。

1. **プロジェクトスキャフォールド**
   - `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `.gitignore`, `.env.local.example`
   - 目的: `npm install` で依存導入、`npx tsc --noEmit` が動く状態にする

2. **最小の Next.js ページが起動することを確認**
   - `app/layout.tsx`, `app/globals.css`, `app/page.tsx`（プレースホルダ）
   - 検証: `npm run build` 成功

3. **共有型定義**
   - `types/form-guide.ts`

4. **機密情報検出ユーティリティ（TDD）**
   - `lib/security/sensitive-detector.test.ts`（先にテスト）
   - `lib/security/sensitive-detector.ts`
   - テストケース: password, credit card (Luhn 簡易), マイナンバー 12 桁, SSN, CVV, PIN, 銀行口座, 正常ケース（氏名・住所）

5. **OpenAI 呼出レイヤ**
   - `lib/openai/prompts.ts`（システムプロンプト）
   - `lib/openai/schema.ts`（zod スキーマ）

6. **OpenAI クライアントラッパ**
   - `lib/openai/client.ts`（server-only、`OPENAI_API_KEY` 読込、ストリーミング不要の chat.completions.parse 呼出）

7. **API Route Handler**
   - `app/api/analyze/route.ts`
   - zod バリデーション → 機密検出 → OpenAI 呼出 → クランプ → 返却
   - 30 秒タイムアウト

8. **クライアント画像リサイズユーティリティ（TDD）**
   - `lib/image/resize.test.ts`
   - `lib/image/resize.ts`
   - 10MB / 4096px 超をアスペクト比維持でリサイズ

9. **Zustand ストア（TDD）**
   - `stores/form-guide-store.test.ts`
   - `stores/form-guide-store.ts`

10. **画像投入 hook**
    - `hooks/use-image-ingest.ts`
    - ファイル選択・D&D・`window.paste` の 3 経路を統合

11. **ImageDropzone コンポーネント**
    - `components/image-dropzone.tsx`
    - hook を利用して UI を構築

12. **AnnotationOverlay コンポーネント（TDD）**
    - `components/annotation-overlay.test.tsx`
    - `components/annotation-overlay.tsx`
    - bbox→SVG 座標変換、クリップ、範囲外スキップ

13. **AnnotatedImage コンポーネント**
    - `components/annotated-image.tsx`
    - `onLoad` で寸法取得し Overlay に渡す

14. **AnnotationLegend コンポーネント（TDD）**
    - `components/annotation-legend.test.tsx`
    - `components/annotation-legend.tsx`

15. **ChatMessage / ChatThread コンポーネント**
    - `components/chat-message.tsx`
    - `components/chat-thread.tsx`

16. **ChatInput コンポーネント**
    - `components/chat-input.tsx`
    - `/api/analyze` 呼出・エラーハンドリング・ローディング制御

17. **SensitiveWarning / LoadingIndicator**
    - `components/sensitive-warning.tsx`
    - `components/loading-indicator.tsx`

18. **ChatContainer で全体組み立て**
    - `components/chat-container.tsx`
    - `app/page.tsx` を更新して `<ChatContainer />` を読み込む

19. **Playwright E2E**
    - `e2e/paste-and-analyze.spec.ts`
    - OpenAI API は MSW 相当でモック、固定 JSON を返す
    - フロー: 画像アップロード → テキスト入力 → 送信 → 注釈オーバーレイが描画されていることを確認

20. **最終検証**
    - `npm run lint && npx tsc --noEmit && npm run build && npx vitest run && npx playwright test`
    - SPEC.md の受け入れ基準を 1 件ずつチェック

---

設計完了。`/implement` で実装フェーズに進んでください。
