'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function VerifyPage() {
    const { id } = useParams();
    const router = useRouter();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(5);
    const [isBlocked, setIsBlocked] = useState(false);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        // Load data from session storage
        const storedQuestions = sessionStorage.getItem('verification_questions');
        const storedName = sessionStorage.getItem('user_display_name');

        if (!storedQuestions) {
            // Redirect to home if no session data
            router.push('/');
            return;
        }

        setQuestions(JSON.parse(storedQuestions));
        setDisplayName(storedName || 'Friend');
    }, [router]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!answer.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const currentQuestion = questions[currentQuestionIndex];

            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: id,
                    questionId: currentQuestion.id,
                    answer,
                }),
            });

            const data = await res.json();

            if (data.blocked) {
                setIsBlocked(true);
                setError(data.message || 'You have been temporarily blocked.');
                return;
            }

            if (data.correct) {
                // Move to next question or finish
                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                    setAnswer('');
                } else {
                    // All done!
                    router.push(`/gratitude/${id}`);
                }
            } else {
                setAttemptsLeft(data.attemptsLeft);
                setError(`Incorrect answer. ${data.attemptsLeft} attempts remaining.`);
                if (data.attemptsLeft <= 0) {
                    setIsBlocked(true); // UI update, though server handles it too
                    // Optionally redirect to default page immediately or show block message then redirect
                    setTimeout(() => {
                        router.push(`/default-gratitude?name=${encodeURIComponent(displayName)}&blocked=true`);
                    }, 2000);
                }
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (questions.length === 0) return null; // Or loading spinner

    if (isBlocked) {
        return (
            <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-red-50 to-pink-100">
                <div className="text-center max-w-md bg-white/70 backdrop-blur-md p-10 rounded-3xl shadow-xl space-y-6">

                    <h1 className="text-4xl font-extrabold text-red-500 mb-4 tracking-wide">
                        Let’s take a short pause 🙈
                    </h1>

                    <p className="text-lg text-gray-700 leading-relaxed mb-4">
                        {error || "Looks like there have been a few too many incorrect attempts."}
                    </p>

                    <p className="text-sm text-gray-500 mb-8">
                        For your security, access is temporarily paused. Don’t worry—you can come back and try again soon.
                    </p>

                    <Button
                        className="mt-4 px-8 py-3 text-lg bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-full shadow-md hover:shadow-lg transition-all"
                        onClick={() => router.push('/')}
                    >
                        Return Home
                    </Button>

                    <p className="mt-4 text-xs text-gray-400 italic">
                        Safety first 💛
                    </p>
                </div>
            </main>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-200 to-blue-300">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
                        Quick Check
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                        Just a moment — this helps make sure it’s really you
                    </p>

                    <div className="flex justify-center space-x-2 mb-6">
                        {questions.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${idx === currentQuestionIndex
                                    ? 'bg-blue-500'
                                    : idx < currentQuestionIndex
                                        ? 'bg-green-400'
                                        : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="bg-white p-8 rounded-3xl shadow-xl"
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            {currentQuestion.text}
                        </h2>

                        <form onSubmit={handleVerify} className="space-y-6">
                            {currentQuestion.type === 'choice' ? (
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setAnswer(option)}
                                            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ease-in-out ${answer === option
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-100 hover:border-blue-200 text-gray-600'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <Input
                                    type="text"
                                    placeholder="Type your answer here…"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-300"
                                />
                            )}

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-500 text-sm text-center"
                                >
                                    That doesn’t look quite right — want to try once more?
                                </motion.p>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-3 text-lg font-semibold shadow-lg focus:ring-2 focus:ring-blue-500"
                                isLoading={isLoading}
                                disabled={!answer.trim()}
                            >
                                Check & Continue →
                            </Button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>

    );
}
