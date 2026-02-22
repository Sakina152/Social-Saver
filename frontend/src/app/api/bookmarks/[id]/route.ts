import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        // 1. Authenticate the user session
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get the logged-in email (The "Bridge" key)
        const userEmail = user.emailAddresses[0].emailAddress;

        const client = await clientPromise;
        const db = client.db("social_saver");

        // 3. Delete ONLY if the ID matches AND the userEmail matches the owner
        const result = await db.collection("bookmarks").deleteOne({
            _id: new ObjectId(id),
            userId: userEmail // This ensures a user can't delete someone else's link
        });

        if (result.deletedCount === 1) {
            return NextResponse.json({ message: "Deleted successfully" });
        }

        // If 0 items were deleted, it's either the wrong ID or the wrong owner
        return NextResponse.json({ error: "Bookmark not found or unauthorized" }, { status: 404 });
    } catch (e) {
        console.error("Delete Error:", e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}