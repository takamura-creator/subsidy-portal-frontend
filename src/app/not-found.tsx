'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="card border border-border">
        <svg className="w-14 h-14 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 8v2m0 4h.01" />
        </svg>
        <h2 className="text-xl font-bold mb-2">ページが見つかりません</h2>
        <p className="text-text-light text-sm mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-xl transition"
          >
            トップに戻る
          </Link>
          <button
            onClick={() => router.back()}
            className="border border-border text-text font-bold px-6 py-3 rounded-xl hover:bg-bg transition"
          >
            前のページに戻る
          </button>
        </div>
      </div>
    </div>
  )
}
