import { Plus, Trash2, Sparkles, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 border border-dashed border-border rounded-2xl text-center max-w-lg mx-auto bg-muted/30"
        >
            <div className="h-16 w-16 bg-background border border-border rounded-xl flex items-center justify-center text-muted-foreground mb-6 shadow-saas-sm">
                <Search size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-foreground tracking-tight mb-2">
                No insights found
            </h3>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-8">
                Paste a social media link in the header or try a different keyword to search your digital brain.
            </p>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    className="rounded-lg border-border hover:bg-muted text-foreground px-6 py-2 h-10 text-sm font-medium"
                    onClick={onClear}
                >
                    Clear Filter
                </Button>
            </div>
        </motion.div>
    );
}

interface ErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-destructive/10 bg-destructive/5 rounded-2xl px-6">
            <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-4">
                <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Synchronization failure</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">{error}</p>
            <Button onClick={onRetry} variant="outline" className="rounded-lg px-6 border-destructive/20 hover:bg-destructive/10 text-destructive text-sm font-medium">
                Retry Connection
            </Button>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="saas-card overflow-hidden flex flex-col h-[320px]">
                    <Skeleton className="h-40 w-full rounded-none bg-muted" />
                    <div className="p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-5 w-2/3 rounded-md bg-muted" />
                            <Skeleton className="h-5 w-12 rounded-full bg-muted" />
                        </div>
                        <Skeleton className="h-16 w-full rounded-md bg-muted" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-full bg-muted" />
                            <Skeleton className="h-6 w-16 rounded-full bg-muted" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
