'use client';
import { Analytics } from '@vercel/analytics/next';

// URLクエリパラメータを除去してVercelに送信（業種・所在地・規模の越境移転防止）
export function AnalyticsWrapper() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          const url = new URL(event.url);
          url.search = '';
          return { ...event, url: url.toString() };
        } catch {
          return event;
        }
      }}
    />
  );
}
