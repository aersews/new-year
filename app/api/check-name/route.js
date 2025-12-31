import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    await dbConnect();

    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const user = await User.findOne({ name: name.toLowerCase().trim() });

        if (!user) {
            return NextResponse.json({ found: false });
        }

        if (user.isBlocked) {
            // Even if blocked manually by admin, we might want to show the default page or a specific blocked message.
            // For now, treat as found but maybe add a flag?
            // The requirements say "Default Gratitude Page Shown when: Name does not exist, Verification fails, User is blocked".
            // So if blocked, maybe we just return found: false?
            // But "Message should include entered name dynamically".
            // Let's return found: false for simplicity, or handle it on frontend.
            // If I return found: false, the frontend shows default page.
            // If I return found: true, the frontend starts verification.
            // If they are blocked, they shouldn't start verification.
            // So returning found: false (or a specific status) is better.
            // Let's return found: false to show default page immediately.
            return NextResponse.json({ found: false });
        }

        // Return questions without answers
        const questions = user.questions.map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            options: q.options,
        }));

        return NextResponse.json({
            found: true,
            userId: user._id,
            displayName: user.displayName,
            questions,
        });

    } catch (error) {
        console.error('Check name error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
