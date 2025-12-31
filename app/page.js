'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function Home() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/check-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (data.found) {
        // Store questions in sessionStorage or pass via state? 
        // Better to fetch them again or pass via query? 
        // Actually, the check-name returned questions. 
        // We can pass the userId to the verify page, and the verify page can fetch questions or we pass them in state.
        // Since verify page is a dynamic route [id], we can just navigate there.
        // But verify page needs to know the questions.
        // Let's store them in sessionStorage to avoid re-fetching or just re-fetch on the verify page.
        // Re-fetching is safer/cleaner. But check-name already did the work.
        // Let's just navigate to /verify/[userId] and let it fetch questions?
        // But check-name was the one that returned questions.
        // If I navigate to /verify/[userId], I need an API to get questions for that user.
        // I didn't create a specific "get questions" API, but I can use check-name again or create one.
        // Actually, check-name is POST.
        // Let's just pass the name to the verify page? No, userId is better.
        // I'll create a simple helper to fetch questions in the verify page, or just use check-name again?
        // Wait, check-name requires name. Verify page has userId.
        // I should probably have an API `GET /api/user/[id]/questions`.
        // I'll add that API or just use sessionStorage. SessionStorage is easiest for now.
        sessionStorage.setItem('verification_questions', JSON.stringify(data.questions));
        sessionStorage.setItem('user_display_name', data.displayName);
        router.push(`/verify/${data.userId}`);
      } else {
        router.push(`/default-gratitude?name=${encodeURIComponent(name)}`);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden relative">

      {/* Ambient Background Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-1/3 -left-1/3 w-[28rem] h-[28rem] bg-purple-300 rounded-full blur-3xl opacity-40 animate-blob" />
        <div className="absolute -top-1/4 -right-1/4 w-[28rem] h-[28rem] bg-yellow-300 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-1/4 left-1/4 w-[28rem] h-[28rem] bg-pink-300 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="w-full max-w-lg text-center"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 tracking-tight">
          Hey,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            you
          </span>{" "}
          ✨
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          A brand new year just started.
          <br />
          I’m{" "}
          <span className="font-semibold text-gray-800 underline decoration-pink-400 decoration-2 underline-offset-4">
            @aersews
          </span>
          , and I left a small message—
          <br />
          <span className="italic text-gray-700">meant only for you.</span>
          <br />
          <br />
          Before you see it, tell me your name.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-center text-lg shadow-md focus:shadow-xl focus:ring-2 focus:ring-pink-400 transition-all duration-300"
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full text-lg py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-300/50 hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
          >
            Open your message →
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
