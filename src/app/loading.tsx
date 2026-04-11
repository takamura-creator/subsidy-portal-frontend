export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="card border border-border animate-pulse">
        <div className="h-8 bg-border rounded w-1/3 mb-6" />
        <div className="h-4 bg-border rounded w-full mb-3" />
        <div className="h-4 bg-border rounded w-2/3 mb-3" />
        <div className="h-4 bg-border rounded w-1/2" />
      </div>
    </div>
  )
}
