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
                className="max-w-2xl w-full bg-white/70 backdrop-blur-lg p-10 md:p-14 rounded-3xl shadow-2xl text-center"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-6 tracking-tight">
                    Hey {name} ✨
                </h1>

                <p className="text-lg md:text-xl text-indigo-800 leading-relaxed mb-8">
                    I couldn’t unlock the original message this time —
                    but that doesn’t mean you should leave empty-handed.
                    <br /><br />
                    So here’s something just as important:
                    a warm wish for a year filled with good moments,
                    small wins, and unexpected smiles.
                </p>

                {!isBlocked && (
                    <div className="mt-10">
                        <p className="text-sm text-indigo-600 mb-4">
                            Want to give it another try?
                        </p>
                        <Button
                            onClick={() => router.push('/')}
                            className="px-8 py-3 text-lg"
                        >
                            Start Again
                        </Button>
                    </div>
                )}

                {isBlocked && (
                    <p className="text-sm text-red-500 mt-8">
                        Things are paused for now — but the good wishes still count 💛
                    </p>
                )}

                <div className="mt-14">
                    <p className="text-xs text-gray-400 italic">
                        Wishing you a beautiful year ahead.
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
