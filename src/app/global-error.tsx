'use client'

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
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
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '24px' }}>
              {error.message || "予期しないエラーが発生しました。"}
            </p>
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
