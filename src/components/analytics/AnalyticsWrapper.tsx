'use client';
import { Analytics } from '@vercel/analytics/next';

// PII（業種・所在地・規模・目的・リダイレクト先URL）が乗るパス — クエリ全除去
const PII_PATHS = [
  '/match/results', // industry, employees, prefecture, purpose
  '/subsidies',     // industry（診断条件の流入）
  '/auth/login',    // returnUrl / redirect（個人パスを含む可能性）
  '/auth/register', // 念のため（フォーム遷移由来のクエリ混入防止）
];

// 計測上必要なクエリキー（PII非該当パスでのみ保全）
// ref は個人ID/紹介コードが乗る可能性があるため除外
const ALLOWED_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function AnalyticsWrapper() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const url = new URL(event.url);
          const isPII = PII_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'));
          if (isPII) {
            url.search = '';
          } else {
            const kept = new URLSearchParams();
            for (const k of ALLOWED_PARAMS) {
              const v = url.searchParams.get(k);
              if (v) kept.set(k, v);
            }
            url.search = kept.toString();
          }
          return { ...event, url: url.toString() };
        } catch {
          // URLパース失敗時は安全側（クエリ全除去）でフォールバック
          try {
            return { ...event, url: event.url.split('?')[0] };
          } catch {
            return null;
          }
        }
      }}
    />
  );
}
