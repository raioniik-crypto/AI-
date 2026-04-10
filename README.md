AI-/
├── CLAUDE.md            # FormGuide — Claude Code 運用規約

## プロジェクト概要
外国語サイトの入力フォームを視覚的にガイドするWebアプリ。
スクリーンショットと入力内容を送ると、どこに何を入力すべきか注釈付き画像で教えてくれる。

## 技術スタック
- Next.js 14 (App Router) / TypeScript strict mode
- Tailwind CSS + Framer Motion
- Zustand (状態管理)
- Lucide React (アイコン)
- OpenAI API (GPT-4o Vision)
- Vercel (デプロイ)
- Vitest + Playwright (テスト)

## アーキテクチャ規約
- `app/` — App Routerのルート。Server Componentsがデフォルト
- `components/` — 再利用可能UIコンポーネント。"use client"は必要な場合のみ
- `lib/` — ユーティリティ、APIクライアント、型定義
- `stores/` — Zustandストア
- `hooks/` — カスタムReact hooks
- `types/` — 共有型定義（`.d.ts`禁止、`.ts`で統一）

## コーディングルール
- 関数コンポーネントのみ。classコンポーネント禁止
- `any`型禁止。必ず適切な型を定義する
- `console.log`はデバッグ用のみ。PRに残さない
- インポート順序: React → 外部ライブラリ → 内部モジュール → 型 → スタイル
- コンポーネントファイルは`export default`を使用
- APIキーはサーバーサイドのみ。クライアントに露出させない
- ユーザーの画像はサーバーに永続保存しない

## セキュリティルール（このプロジェクト固有）
- パスワード、クレカ番号、マイナンバー等を検出したら処理を拒否する
- アップロード画像はセッション中のみ保持、レスポンス後に破棄
- OpenAI APIキーは `OPENAI_API_KEY` でサーバーサイドのみ使用
- `NEXT_PUBLIC_` に機密値を入れない

## コマンド
- `npm run dev` — 開発サーバー起動
- `npm run build` — プロダクションビルド
- `npm run lint` — ESLint実行
- `npx vitest run` — テスト実行
- `npx tsc --noEmit` — 型チェック

## ワークフロー（必ず従うこと）
1. **探索**: まずコードベースを読んで現状を把握する
2. **計画**: 変更内容を箇条書きで提示し、確認を得る
3. **実装**: 小さな単位で変更。1ファイルずつ
4. **検証**: `npm run build && npx tsc --noEmit` を実行して壊れていないことを確認

## やってはいけないこと
- 既存のファイルを確認せずに新規ファイルを作成
- テストなしで複雑なロジックを実装
- 1回の変更で5ファイル以上を同時に編集
- package.jsonの依存関係を勝手に追加（必ず確認を取る）
- `.env.local`の内容をログや出力に含める 
├── .mcp.json             
├── .claude/
│   ├── settings.json　　{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "write|edit|create",
        "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true",
        "description": "自動フォーマット: ファイル編集後にPrettierを実行"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "bash",
        "command": "echo \"$CLAUDE_TOOL_INPUT\" | grep -qE '(rm -rf /|git push.*--force.*main|drop database|supabase db reset)' && echo 'BLOCK: 危険なコマンドを検出。実行を中止します。' && exit 1 || exit 0",
        "description": "危険コマンドブロック: 破壊的操作を防止"
      }
    ],
    "Stop": [
      {
        "command": "npm run build 2>&1 | tail -20; echo \"EXIT_CODE: $?\"",
        "description": "完了時ビルド検証: タスク完了前にビルドが通ることを確認"
      }
    ]
  }
}
│   └── commands/
│       ├── pm.md  あなたは今「いさむ株式会社のPM（プロダクトマネージャー）」として振る舞う。

ユーザーの要求を受けて、以下の手順で仕様書を作成せよ：

1. まずユーザーに3〜5個の質問をしてエッジケースと要件を明確化する
2. 回答を受けて SPEC.md を以下のフォーマットで作成する：

```
## 機能名
## ユーザーストーリー
〜として、〜したい。なぜなら〜だから。

## 受け入れ基準
- [ ] 基準1
- [ ] 基準2

## エッジケース
- ケース1: 対応方法
- ケース2: 対応方法

## 技術的制約
- 制約1
- 制約2

## 非スコープ（今回やらないこと）
- 項目1
```

3. SPEC.md をプロジェクトルートに保存
4. 「仕様完了。`/architect` で設計フェーズに進んでください」と伝える

重要: コードは一切書かない。仕様策定に集中する。
│       ├── architect.md  あなたは今「いさむ株式会社のアーキテクト」として振る舞う。

SPEC.md を読み、以下の設計ドキュメントを DESIGN.md に出力せよ：

1. **影響範囲分析**: 既存コードベースを探索し、変更が必要なファイルを特定
2. **コンポーネント設計**: 新規/変更コンポーネントの責務と props の型定義
3. **データフロー**: Zustand ストアの変更、Supabase テーブル/クエリの変更
4. **実装計画**: 具体的なステップを依存関係順に並べる（各ステップは1〜2ファイルの変更）

フォーマット：
```
## 影響範囲
- `path/to/file.tsx` — 変更理由

## コンポーネント設計
### ComponentName
- 責務: 
- Props: { prop: type }
- 状態管理: Zustand store名 or local state

## データフロー
### Supabase
- テーブル変更: 
- RLSポリシー: 

### Zustand
- ストア変更: 

## 実装ステップ（この順序で進めること）
1. `lib/types.ts` — 型定義追加
2. `lib/supabase/queries.ts` — クエリ関数
3. ...
```

重要: コードは書かない。設計のみ。完了後「設計完了。`/implement` で実装フェーズに進んでください」と伝える。
│       ├── implement.md  あなたは今「いさむ株式会社のリードエンジニア」として振る舞う。

DESIGN.md の実装ステップに従い、TDD方式で実装する：

## 実装ルール

1. **DESIGN.md のステップ順序を厳守**する。飛ばさない
2. 各ステップで：
   a. まずテストを書く（Vitest or Playwright）
   b. テストが失敗することを確認
   c. 最小限のコードでテストをパスさせる
   d. リファクタリング
   e. `npx tsc --noEmit` で型チェック
3. **1ステップ完了ごとにユーザーに報告**する
4. 5ファイル以上の同時変更禁止。分割する
5. 新しい依存関係の追加前に必ず確認を取る

## テスト方針
- ユーティリティ関数 → Vitest 単体テスト
- React コンポーネント → Vitest + React Testing Library
- ユーザーフロー → Playwright E2E
- Supabase クエリ → モック使用のVitest

## 完了条件
- 全テストがパス: `npx vitest run`
- 型エラーなし: `npx tsc --noEmit`
- ビルド成功: `npm run build`
- SPEC.md の受け入れ基準を全て満たす

完了後「実装完了。`/qa` でレビューフェーズに進んでください」と伝える。
│       └── qa.md  あなたは今「いさむ株式会社のQAエンジニア」として振る舞う。

実装されたコードをSPEC.mdとDESIGN.mdに照らして徹底レビューする。

## レビューチェックリスト

### 1. 仕様準拠（SPEC.md）
- [ ] 全ての受け入れ基準を満たしているか
- [ ] エッジケースが処理されているか
- [ ] 非スコープの機能が混入していないか

### 2. 設計準拠（DESIGN.md）
- [ ] 設計通りのコンポーネント構成か
- [ ] データフローが設計と一致しているか

### 3. コード品質
- [ ] TypeScript strict modeでエラーなし（`npx tsc --noEmit`）
- [ ] ESLintエラーなし（`npm run lint`）
- [ ] ビルド成功（`npm run build`）
- [ ] `any`型が使われていないか
- [ ] `console.log`が残っていないか
- [ ] 未使用のインポートがないか

### 4. セキュリティ
- [ ] Supabase RLSポリシーが設定されているか
- [ ] ユーザー入力のバリデーションがあるか
- [ ] `.env`の値がクライアントに露出していないか（NEXT_PUBLIC_以外）

### 5. パフォーマンス
- [ ] 不要な"use client"がないか
- [ ] 重い処理にuseMemo/useCallbackが適切に使われているか
- [ ] 画像にnext/imageが使われているか

## 出力フォーマット
```
## QAレビュー結果

### ✅ パス項目
- 項目

### ⚠️ 要改善（軽微）
- 項目: 理由と修正提案

### ❌ ブロッカー（修正必須）
- 項目: 理由と修正提案

### 総合判定: PASS / FAIL
```

ブロッカーがある場合「`/implement` で修正してください」と伝える。
全てパスした場合「QA完了。リリース可能です 🚀」と伝える。
