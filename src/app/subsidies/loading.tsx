export default function SubsidiesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="h-9 bg-border rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card border border-border animate-pulse">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-16 bg-border rounded" />
              <div className="h-5 w-14 bg-border rounded" />
            </div>
            <div className="h-5 bg-border rounded w-3/4 mb-2" />
            <div className="h-3 bg-border rounded w-1/2 mb-4" />
            <div className="flex gap-3 mb-3">
              <div className="flex-1 bg-bg rounded-lg h-16" />
              <div className="flex-1 bg-bg rounded-lg h-16" />
            </div>
            <div className="h-9 bg-border rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
