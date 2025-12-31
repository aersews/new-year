import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attempt from '@/models/Attempt';
import AnswerLog from '@/models/AnswerLog';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    await dbConnect();

    const { userId, questionId, answer } = await request.json();
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    const identifier = `${ip}-${userAgent}`;

    // Simple device parsing (can be enhanced with a library later)
    let deviceInfo = 'Unknown Device';
    if (/mobile/i.test(userAgent)) deviceInfo = 'Mobile';
    if (/android/i.test(userAgent)) deviceInfo = 'Android';
    if (/iphone|ipad|ipod/i.test(userAgent)) deviceInfo = 'iOS';
    if (/windows/i.test(userAgent)) deviceInfo = 'Windows';
    if (/mac/i.test(userAgent)) deviceInfo = 'Mac';
    if (/linux/i.test(userAgent)) deviceInfo = 'Linux';

    // Check attempts
    let attempt = await Attempt.findOne({ identifier });

    if (attempt && attempt.blockedUntil && new Date() < attempt.blockedUntil) {
        return NextResponse.json({
            correct: false,
            blocked: true,
            message: 'Temporarily blocked. Please try again later.'
        });
    }

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const question = user.questions.find(q => q.id === questionId);
    if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Normalize answers
    const normalizedInput = answer.toString().toLowerCase().trim();
    const normalizedExpected = question.answer.toLowerCase().trim();

    const isCorrect = normalizedInput === normalizedExpected;

    // Log the answer
    await AnswerLog.create({
        userId,
        questionId,
        answer,
        isCorrect,
        blocked: false, // If we reached here, they weren't blocked yet
        ip,
        userAgent,
        deviceInfo
    });

    if (isCorrect) {
        // Optional: Reset attempts on success? 
        // User asked for "total 4 attempts", which usually implies a strict limit or consecutive.
        // I'll keep the strict count for now, or maybe reset on success? 
        // Previously we didn't reset. Let's stick to not resetting to be safe, or just logic as requested.
        // Actually, "total 4 attempts" usually means "4 chances". 
        // I will NOT reset count on success to prevent brute force across questions if that's the goal, 
        // BUT usually valid users should keep going. 
        // Let's reset count if they get it right, so they can continue to next question?
        // The previous simple version (step 23) did NOT reset. I will follow that.

        return NextResponse.json({ correct: true });
    } else {
        // Handle failure
        if (!attempt) {
            attempt = new Attempt({ identifier });
        }

        attempt.count += 1;
        attempt.lastAttemptedUserId = userId;

        const LIMIT = 4;

        if (attempt.count >= LIMIT) {
            attempt.blockedUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
        }

        await attempt.save();

        return NextResponse.json({
            correct: false,
            attemptsLeft: Math.max(0, LIMIT - attempt.count),
            blocked: attempt.count >= LIMIT
        });
    }
}
