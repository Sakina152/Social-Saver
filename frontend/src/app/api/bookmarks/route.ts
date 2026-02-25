import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    try {
        // 1. Get the authenticated user from Clerk
        const { userId } = await auth();
        const user = await currentUser();

        // 2. Block unauthorized access
        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 3. Get the user's email address 
        // This is what matches the 'userId' field saved by your Python bot
        const userEmail = user.emailAddresses[0].emailAddress;

        const client = await clientPromise;
        const db = client.db("social_saver");

        // 4. Query logic: Always filter by the linked email
        let query: any = { userId: userEmail };

        if (q) {
            query = {
                $and: [
                    { userId: userEmail }, // Ensure privacy
                    {
                        $or: [
                            { summary: { $regex: q, $options: 'i' } },
                            { category: { $regex: q, $options: 'i' } },
                            { hashtags: { $in: [new RegExp(q, 'i')] } }
                        ]
                    }
                ]
            };
        }

        const bookmarks = await db.collection("bookmarks")
            .find(query)
            .sort({ created_at: -1 })
            .toArray();

        return NextResponse.json(bookmarks);
    } catch (e) {
        console.error("Fetch Error:", e);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = user.emailAddresses[0].emailAddress;
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Forward to Python Backend
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: url,
                sender: userEmail
            })
        });

        if (!response.ok) {
            throw new Error('Backend pipeline failed');
        }

        return NextResponse.json({ status: 'success', message: 'Bookmark processing started' });
    } catch (e: any) {
        console.error("Post Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to save' }, { status: 500 });
    }
}