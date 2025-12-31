'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

function DefaultGratitudeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const name = searchParams.get('name') || 'Friend';
    const isBlocked = searchParams.get('blocked') === 'true';

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="max-w-2xl w-full bg-white/80 backdrop-blur-lg p-10 md:p-14 rounded-3xl shadow-2xl text-center"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-6 tracking-tight">
                    Hey {name} ✨
                </h1>

                <p className="text-lg md:text-xl text-indigo-800 leading-relaxed mb-8">
                    Hm… it seems your message didn’t arrive. But no worries — <strong>you were thought of</strong>!
                    <br /><br />
                    Maybe try a different <u>name</u>? Sometimes we recognize you better that way.
                    <br /><br />
                    Either way, wishing you a year full of <strong>little wins</strong> and unexpected <em>smiles</em>.
                </p>


                {!isBlocked && (
                    <Button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 text-lg shadow-md hover:shadow-lg transition-all"
                    >
                        Try Again
                    </Button>
                )}

                {isBlocked && (
                    <p className="text-sm text-red-500 mt-8">
                        Access is paused for now, but my good wishes still stand 💛
                    </p>
                )}

                <div className="mt-10">
                    <p className="text-xs text-gray-400 italic">
                        With warmth and care, wishing you a wonderful year ahead.
                    </p>
                </div>
            </motion.div>
        </main>

    );
}

export default function DefaultGratitudePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-gray-500">
                    Loading…
                </div>
            }
        >
            <DefaultGratitudeContent />
        </Suspense>
    );
}
