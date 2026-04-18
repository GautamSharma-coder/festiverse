import React from 'react';
import UdaanHeroImage from '../assets/UdaanHeroImage.webp';

const HeroSection = () => {
    return (
        <header id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-black">
            
            {/* 1. LCP Optimization: Use an img tag with fetchPriority */}
            <img 
                src={UdaanHeroImage} 
                alt="Udaan Arts and Cultural Club Background" 
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
                fetchPriority="high" // Tells the browser to load this asset immediately
            />

            {/* Mild blur overlay for the background image */}
            <div className="absolute inset-0 z-0 backdrop-blur-[2px]"></div>

            {/* Radial gradient background overlay */}
            <div className="absolute inset-0 z-0 opacity-70" style={{
                background: 'radial-gradient(circle at center, rgba(127, 29, 29, 0.4), black, black)'
            }}></div>

            {/* Floating icons */}
            <div className="absolute top-1/3 left-[10%] opacity-20 animate-float z-10" style={{ animationDuration: '8s' }}>
                <iconify-icon icon="solar:masks-linear" width="80"></iconify-icon>
            </div>
            <div className="absolute bottom-1/3 right-[10%] opacity-20 animate-float z-10" style={{ animationDuration: '10s' }}>
                <iconify-icon icon="solar:music-note-linear" width="80"></iconify-icon>
            </div>

            {/* Main content */}
            <div className="z-10 text-center space-y-6 max-w-5xl px-4 relative">
                {/* Replaced inline padding with Tailwind px-4 py-1 */}
                <div className="inline-block rounded-full border border-red-500/30 bg-red-500/10 mb-6 px-4 py-1">
                    {/* Replaced inline margin with Tailwind ml-1 */}
                    <span className="text-red-500 text-xs font-semibold uppercase tracking-[0.15em] ml-1">
                        Est. 2019 • GEC Samastipur
                    </span>
                </div>
                <h1 className="text-6xl md:text-8xl font-serif italic font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-2xl">
                    UDAAN
                </h1>
                {/* Replaced inline padding with Tailwind p-2.5 */}
                <p className="text-lg md:text-xl text-zinc-400 font-light max-w-xl mx-auto leading-relaxed p-2.5">
                    Where culture meets creativity. The official Arts & Cultural Club.
                </p>
            </div>

            {/* Bottom marquee */}
            <div className="absolute bottom-10 z-10 w-full overflow-hidden border-y border-white/5 py-4 backdrop-blur-md">
                {/* Added gap-16 to handle spacing structurally instead of using underscores */}
                <div className="whitespace-nowrap flex animate-marquee gap-16">
                    <span className="text-4xl md:text-5xl font-serif italic text-white tracking-tighter">
                        UNFOLDING DRAMA AND ART FOR NATION
                    </span>
                    <span className="text-4xl md:text-5xl font-serif italic text-white tracking-tighter">
                        UNFOLDING DRAMA AND ART FOR NATION
                    </span>
                    {/* Added a third span to prevent a "snap" effect on ultra-wide monitors */}
                    <span className="text-4xl md:text-5xl font-serif italic text-white tracking-tighter" aria-hidden="true">
                        UNFOLDING DRAMA AND ART FOR NATION
                    </span>
                </div>
            </div>
        </header>
    );
};

export default HeroSection;
