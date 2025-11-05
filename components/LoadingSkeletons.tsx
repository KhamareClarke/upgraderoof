export function BlogPostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="relative h-56 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="flex gap-3">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function FeaturedBlogSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="relative h-72 bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-8 bg-gray-200 rounded w-4/5" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg animate-pulse">
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded mb-2" />
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="pt-4 border-t border-gray-200 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export function GalleryImageSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
    </div>
  );
}
