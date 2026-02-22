"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import {
    Inbox,
    Boxes,
    Hash,
    Calendar,
    Settings,
    ChevronDown,
    Clock,
    Tag
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const mainNav = [
        { name: 'All Insights', icon: Inbox, href: '/' },
        { name: 'Library', icon: Boxes, href: '#' },
    ];

    const categories = ['Fitness', 'Tech', 'Education', 'Entertainment', 'Music'];
    const hashtags = ['coding', 'health', 'career', 'motivation'];
    const dates = [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
    ];

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-60 border-r border-border bg-muted/20 overflow-y-auto hide-scrollbar z-40 hidden lg:flex flex-col">
            <div className="p-4 space-y-8">
                {/* Main Nav */}
                <div className="space-y-1">
                    {mainNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                                    isActive
                                        ? "bg-muted text-foreground shadow-saas-sm"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <item.icon size={16} className={cn(isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Categories
                        <ChevronDown size={12} />
                    </div>
                    <div className="space-y-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group"
                            >
                                <div className="h-1.5 w-1.5 rounded-full bg-border group-hover:bg-primary" />
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Time Period
                    </div>
                    <div className="space-y-1">
                        {dates.map((date) => (
                            <button
                                key={date.value}
                                className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                            >
                                <Clock size={14} className="text-muted-foreground" />
                                {date.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-4 pb-8">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Popular Tags
                    </div>
                    <div className="flex flex-wrap gap-2 px-3">
                        {hashtags.map((tag) => (
                            <button
                                key={tag}
                                className="px-2 py-1 rounded-md bg-muted border border-border text-[10px] font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all uppercase tracking-tighter"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-auto p-4 border-t border-border bg-background">
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-all group">
                    <Settings size={16} className="group-hover:rotate-90 transition-transform" />
                    Settings
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
