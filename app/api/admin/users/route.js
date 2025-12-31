import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const users = await User.find({ isBlocked: { $ne: true } }).sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    try {
        const data = await request.json();

        // Basic validation
        if (!data.name || !data.displayName || !data.gratitudeContent) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.create(data);
        return NextResponse.json(user);
    } catch (error) {
        console.error('Create user error:', error);
        if (error.code === 11000) {
            // Duplicate key error (if we had unique constraint on name, but we don't, only index. 
            // Wait, multiple users can share the same name. So no unique constraint on name.
            // But if we had one, handle it.
        }
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
    }
}
