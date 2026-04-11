'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
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
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="card border border-border">
        <svg className="w-14 h-14 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">エラーが発生しました</h2>
        <p className="text-text-light text-sm mb-6">
          {error.message || "予期しないエラーが発生しました。"}
        </p>
        {error.digest && (
          <p className="text-xs text-text-light mb-4">エラーID: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => unstable_retry()}
            className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-xl transition"
          >
            再試行
          </button>
          <Link
            href="/"
            className="border border-border text-text font-bold px-6 py-3 rounded-xl hover:bg-bg transition"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
