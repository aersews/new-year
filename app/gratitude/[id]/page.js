'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export default function GratitudePage() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user details (we need an API for this)
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/gratitude/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                    // Trigger confetti animation on successful loading
                    const duration = 3 * 1000;
                    const animationEnd = Date.now() + duration;
                    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                    const randomInRange = (min, max) => Math.random() * (max - min) + min;

                    const interval = setInterval(function () {
                        const timeLeft = animationEnd - Date.now();

                        if (timeLeft <= 0) {
                            return clearInterval(interval);
                        }

                        const particleCount = 50 * (timeLeft / duration);
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                    }, 250);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-indigo-50">Loading...</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-50 to-indigo-50">Message not found.</div>;

    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-100 to-indigo-200 p-6 md:p-12 font-serif">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-[3rem] shadow-2xl border-8 border-double border-pink-200 relative overflow-hidden"
            >
                {/* Decorative Top Bar */}
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300"></div>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 font-sans tracking-tight">
                        Happy New Year, <br />
                        <span className="text-pink-500">{user.displayName}!</span>
                    </h1>
                    <div className="w-24 h-1 bg-pink-200 mx-auto rounded-full"></div>
                </div>

                {/* Message Content */}
                <div
                    className="prose prose-lg md:prose-xl mx-auto text-gray-700 leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-pink-400 first-letter:mr-3 first-letter:float-left"
                    dangerouslySetInnerHTML={{ __html: user.gratitudeContent }}
                />

                {/* Footer Signature */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-gray-500 italic">
                        With love and gratitude, <br />
                        — aersews
                    </p>
                </div>
            </motion.div>

            {/* Feedback Link */}
            <div className="mt-8 mb-8 text-center">
                <p className="text-sm text-gray-600 mb-1">
                    Your thoughts mean a lot — it only takes a moment:
                </p>
                <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdeRbby2jDSem1kDTUYoTnDyAmhoN-2SzFEBFJ6Pb8ZHNGBPw/viewform?usp=publish-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-pink-400 hover:text-pink-500 text-sm underline transition-colors"
                >
                    Share your feedback (anonymous)
                </a>
            </div>
        </main>

    );
}
