"use client";
import { useState, useEffect, useCallback, Suspense } from 'react';
import BookmarkCard from '@/components/BookmarkCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

import { DashboardSkeleton, ErrorState, EmptyState } from '@/components/DashboardStates';

interface Bookmark {
  _id: string;
  url: string;
  category: string;
  summary: string;
  explainability: string;
  hashtags: string[];
  status: string;
}

// Sub-component to handle SearchParams safely in Next.js 14/15
function DashboardContent() {
  const { isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [data, setData] = useState<Bookmark[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!isLoaded || !isSignedIn) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookmarks?q=${query}`);
      if (!res.ok) throw new Error('Failed to fetch bookmarks');
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [query, isLoaded, isSignedIn]);

  useEffect(() => {
    fetchBookmarks();

    // Listen for new bookmarks added from the header
    const handleRefresh = () => fetchBookmarks();
    window.addEventListener('insight-added', handleRefresh);

    return () => {
      window.removeEventListener('insight-added', handleRefresh);
    };
  }, [fetchBookmarks]);

  const filteredData = selectedCategory === "All"
    ? data
    : data.filter((item) => item.category === selectedCategory);

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <div className="flex-1 min-h-screen bg-background">
      <main className="lg:pl-60 pt-6 px-4 sm:px-8 max-w-screen-2xl mx-auto">
        {/* Dashboard Title & Stats */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Insights</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Manage and search your collected intelligence.
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground font-medium text-[10px] uppercase tracking-widest">Total Saves</p>
              <p className="font-bold text-lg">{data.length}</p>
            </div>
          </div>
        </div>

        {/* Content Feed */}
        <div className="pb-20">
          {loading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <ErrorState error={error} onRetry={fetchBookmarks} />
            </div>
          ) : filteredData.length === 0 ? (
            <EmptyState onClear={() => setSelectedCategory("All")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredData.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BookmarkCard
                      bookmark={item}
                      onDelete={fetchBookmarks}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Wrapper to handle Suspense for SearchParams
export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}