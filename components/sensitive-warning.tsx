import { ShieldAlert } from 'lucide-react';

interface SensitiveWarningProps {
  detectedCategories: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  password: 'パスワード',
  'credit-card': 'クレジットカード番号',
  cvv: 'セキュリティコード (CVV)',
  pin: 'PIN コード',
  'my-number': 'マイナンバー',
  ssn: '社会保障番号 (SSN)',
  'bank-account': '銀行口座情報',
};

export default function SensitiveWarning({
  detectedCategories,
}: SensitiveWarningProps): JSX.Element {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-900"
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">
          機密情報を検出したため、処理を中止しました。
        </p>
        <p className="text-xs">
          以下のカテゴリが入力内容に含まれていました:
        </p>
        <ul className="list-disc pl-4 text-xs">
          {detectedCategories.map((category) => (
            <li key={category}>
              {CATEGORY_LABELS[category] ?? category}
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs">
          該当情報を削除してから再送信してください。
        </p>
      </div>
    </div>
  );
}
