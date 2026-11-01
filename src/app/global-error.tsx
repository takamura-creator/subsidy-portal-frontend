'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Noto Sans JP', sans-serif", background: '#f8f9fa', color: '#1a1a2e', margin: 0 }}>
        <div style={{ maxWidth: '480px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              システムエラーが発生しました
            </h2>
            {/* error.message は画面に出さない（console には出す・2026-11-01 PR-A） */}
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: error.digest ? '8px' : '24px' }}>
              予期しないエラーが発生しました。時間をおいて、もう一度お試しください。
            </p>
            {error.digest && (
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '24px' }}>
                エラーID: {error.digest}
              </p>
            )}
            <button
              onClick={() => unstable_retry()}
              style={{
                background: '#ff6b35', color: '#fff', fontWeight: 700,
                padding: '12px 32px', borderRadius: '12px', border: 'none',
                cursor: 'pointer', fontSize: '1rem',
              }}
            >
              再試行
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
