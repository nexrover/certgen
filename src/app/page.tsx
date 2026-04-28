'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('deleted') === 'true') {
      setTimeout(() => {
        setToastMessage("Your account has been successfully deleted.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 0);
      setTimeout(() => setToastMessage(null), 5000);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans transition-colors duration-300">
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
      <div className="w-full px-4 md:px-6 fixed top-0 z-50 pt-4 md:pt-6 transition-all duration-300">
        <nav
          className={`mx-auto max-w-6xl flex justify-between items-center px-4 py-3 md:px-6 md:py-3 transition-all duration-300 rounded-full bg-white/90 border border-white/50 backdrop-blur-xl ${isScrolled
              ? 'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1),0_15px_25px_-10px_rgba(0,0,0,0.05)]'
              : 'shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05),0_5px_15px_-5px_rgba(0,0,0,0.02)]'
            }`}
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-xl md:text-2xl tracking-tight text-text"
          >
            {/* Adding a stylized 'C' similar to the 'N' in the NexRover logo */}
            <span className="text-brand text-2xl md:text-3xl font-extrabold leading-none tracking-tighter">C</span>
            <span>ertGen</span>
          </Link>

          <div className="hidden md:flex gap-6 lg:gap-8">
            <Link href="#home" className="text-secondary hover:text-text text-sm font-medium transition-colors">Home</Link>
            <Link href="#how-we-work" className="text-secondary hover:text-text text-sm font-medium transition-colors">How We Work</Link>
            <Link href="#products" className="text-secondary hover:text-text text-sm font-medium transition-colors">Products</Link>
            <Link href="#about" className="text-secondary hover:text-text text-sm font-medium transition-colors">About</Link>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="hidden sm:block text-secondary hover:text-text text-sm font-medium transition-colors">Sign In</Link>
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-primary to-brand text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-medium hover:shadow-lg hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              Get Started <span>&rarr;</span>
            </Link>
          </div>
        </nav>
      </div>

      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-24 md:py-32 relative overflow-hidden">
        {/* Subtle background glow effect matching Vercel/Linear aesthetic */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-4xl z-10 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-text to-gray-500 mb-6 md:mb-8">
            Create professional certificates in seconds.
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            The modern standard for generating, verifying, and distributing secure digital certificates designed for schools, events, and businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <Link
              href="/dashboard"
              className="bg-primary text-bg px-8 py-3.5 rounded-lg text-base font-semibold hover:-translate-y-1 hover:shadow-xl transition-all w-full sm:w-auto text-center"
            >
              Get Started
            </Link>
            <Link
              href="#learn-more"
              className="bg-transparent text-text px-8 py-3.5 rounded-lg text-base font-semibold border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all w-full sm:w-auto text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
