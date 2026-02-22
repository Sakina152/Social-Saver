"use client";
import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserButton, SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const Header = () => {
    const { isLoaded, user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
    const [pasteValue, setPasteValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchValue) {
                params.set('q', searchValue);
            } else {
                params.delete('q');
            }
            router.push(`${pathname}?${params.toString()}`);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue, router, pathname, searchParams]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pasteValue) return;

        setIsSaving(true);
        try {
            const res = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: pasteValue })
            });

            if (!res.ok) throw new Error('Save failed');

            setPasteValue('');
            // Trigger UI refresh via custom event
            window.dispatchEvent(new CustomEvent('insight-added'));
            alert("Insight extraction started! It will appear shortly.");
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save link. Please check your connection.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-16">
            <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between gap-4">
                {/* Branding */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-saas-sm">
                        <Sparkles size={18} />
                    </div>
                    <span className="text-lg font-bold tracking-tight hidden lg:block">Social Saver</span>
                </div>

                {/* Hero Action: Paste Link */}
                <div className="flex-1 max-w-2xl px-4">
                    <form onSubmit={handleSave} className="relative group">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Paste Instagram or Reel link..."
                            value={pasteValue}
                            onChange={(e) => setPasteValue(e.target.value)}
                            className="w-full bg-muted border border-border focus:border-primary focus:bg-background rounded-lg h-10 pl-10 pr-24 text-sm outline-none transition-all shadow-saas-sm"
                        />
                        <button
                            type="submit"
                            disabled={isSaving || !pasteValue}
                            className="absolute right-1 top-1 h-8 px-4 bg-primary hover:bg-brand-600 disabled:bg-muted-foreground text-primary-foreground rounded-md text-xs font-semibold transition-all shadow-saas-sm flex items-center gap-2"
                        >
                            {isSaving ? "Saving..." : "Save Link"}
                        </button>
                    </form>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="relative hidden sm:block w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full bg-muted/50 border border-transparent focus:border-border focus:bg-background rounded-lg h-9 pl-9 pr-3 text-sm outline-none transition-all"
                        />
                    </div>

                    <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

                    <div className="flex items-center gap-3">
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "h-8 w-8 border border-border",
                                        userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-primary/20"
                                    }
                                }}
                            />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="outline" className="h-9 px-4 text-xs font-semibold border-border hover:bg-muted">
                                    Log In
                                </Button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
