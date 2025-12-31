import dbConnect from '@/lib/db';
import AnswerLog from '@/models/AnswerLog';
import User from '@/models/User'; // Ensure User is registered
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    await dbConnect();
    try {
        // Fetch last 100 logs
        const logs = await AnswerLog.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'name displayName');

        return NextResponse.json(logs);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
