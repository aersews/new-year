import dbConnect from '@/lib/db';
import Attempt from '@/models/Attempt';
import User from '@/models/User'; // Ensure User is registered
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const blockedUsers = await Attempt.find({
            blockedUntil: { $gt: new Date() }
        })
            .sort({ updatedAt: -1 })
            .populate('lastAttemptedUserId', 'name displayName');

        return NextResponse.json(blockedUsers);
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    await dbConnect();
    try {
        const { identifier } = await request.json();
        await Attempt.deleteOne({ identifier });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
