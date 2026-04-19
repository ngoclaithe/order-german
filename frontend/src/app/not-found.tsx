'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="text-center relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-9xl font-black bg-gradient-to-r from-rose-400 via-violet-400 to-cyan-400 text-transparent bg-clip-text mb-4">
                    404
                </div>
                <h1 className="text-3xl font-extrabold mb-2">Page Not Found</h1>
                <p className="text-white/50 mb-8 max-w-sm mx-auto">
                    The page you are looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href="/">
                    <button className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold active:scale-95 transition-transform shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                        <Home size={18} />
                        Back to Home
                    </button>
                </Link>
            </div>
        </main>
    );
}
