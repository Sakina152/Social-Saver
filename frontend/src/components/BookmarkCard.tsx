"use client";
import React from 'react';
import { InstagramEmbed } from 'react-social-media-embed';
import { motion } from 'framer-motion';
import { ExternalLink, Instagram, Star, Copy, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface BookmarkCardProps {
    bookmark: {
        _id: string;
        url: string;
        category: string;
        summary: string;
        explainability: string;
        hashtags: string[];
    };
    onDelete: () => void;
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
    const isInstagram = bookmark.url.includes("instagram.com");

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookmark.url);
        alert("Link copied to clipboard!");
    };

    const handleDelete = async () => {
        if (window.confirm("Archive this insight?")) {
            try {
                const res = await fetch(`/api/bookmarks/${bookmark._id}`, {
                    method: 'DELETE',
                });
                if (res.ok) onDelete();
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="saas-card flex flex-col group h-full"
        >
            {/* Card Header: Platform + Category */}
            <div className="p-4 flex items-center justify-between border-b border-border bg-muted/10">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-background border border-border flex items-center justify-center shadow-saas-sm">
                        {isInstagram ? <Instagram size={14} className="text-pink-500" /> : <ExternalLink size={14} className="text-primary" />}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                        {bookmark.category || "General"}
                    </Badge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={copyToClipboard} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors" title="Copy Link">
                        <Copy size={12} />
                    </button>
                    <button onClick={handleDelete} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md text-muted-foreground transition-colors" title="Archive">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Media/Preview (Compact) */}
            <div className="h-32 w-full bg-muted/30 relative overflow-hidden flex items-center justify-center border-b border-border">
                {isInstagram ? (
                    <div className="scale-75 origin-top opacity-80 group-hover:opacity-100 transition-opacity">
                        <InstagramEmbed url={bookmark.url} width="100%" />
                    </div>
                ) : (
                    <div className="text-muted-foreground/20">
                        <ExternalLink size={48} strokeWidth={1} />
                    </div>
                )}
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 hover:bg-primary/[0.02] transition-colors cursor-alias"
                />
            </div>

            {/* Content: Summary Focus */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-foreground leading-snug tracking-tight mb-3 line-clamp-3">
                    {bookmark.summary || "Extracting the brilliance..."}
                </h3>

                {/* Hashtags */}
                {bookmark.hashtags && bookmark.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                        {bookmark.hashtags.map((tag) => (
                            <span key={tag} className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats/Date */}
            <div className="px-5 py-3 border-t border-border bg-muted/10 mt-auto flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    Saved Today
                </span>
                <div className="flex items-center gap-4 text-muted-foreground">
                    <Star size={14} className="hover:text-amber-500 cursor-pointer transition-colors" />
                    <ExternalLink size={14} className="hover:text-primary cursor-pointer transition-colors" />
                </div>
            </div>
        </motion.div>
    );
}
