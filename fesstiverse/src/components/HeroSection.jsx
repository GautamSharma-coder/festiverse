import React from 'react';
import UdaanHeroImage from '../assets/UdaanHeroImage.webp';

const HeroSection = () => {
    return (
        <header id="home" className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden" style={{
            backgroundImage: `url(${UdaanHeroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            {/* Radial gradient background overlay */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(circle at center, rgba(127, 29, 29, 0.4), black, black)',
                opacity: 0.7
            }}></div>

            {/* Floating icons */}
            <div className="absolute top-1/3 left-[10%] opacity-20 animate-float" style={{ animationDuration: '8s' }}>
                <iconify-icon icon="solar:masks-linear" width="80"></iconify-icon>
            </div>
            <div className="absolute bottom-1/3 right-[10%] opacity-20 animate-float" style={{ animationDuration: '10s' }}>
                <iconify-icon icon="solar:music-note-linear" width="80"></iconify-icon>
            </div>

            {/* Main content */}
            <div className="z-10 text-center space-y-6 max-w-5xl px-4">
                <span className="inline-block px-3 py-1 rounded-full border border-red-500/30 text-red-500 text-xs tracking-[0.2em] uppercase bg-red-500/5 backdrop-blur-sm mb-4">
                    Est. 2019 • GEC Samastipur
                </span>
                <h1 className="text-6xl md:text-8xl font-serif italic font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-2xl">
                    UDAAN
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 font-light max-w-1xl mx-auto leading-relaxed " style={{ padding: '10px' }}>
                    Where culture meets creativity. The official Arts & Cultural Club.
                </p>
            </div>

            {/* Bottom marquee */}
            <div className="absolute bottom-10 w-full overflow-hidden border-y border-white/5 py-4 bg-black/40 backdrop-blur-md">
                <div className="whitespace-nowrap flex animate-marquee">
                    <span className="text-4xl md:text-5xl font-serif italic text-white mx-4 tracking-tighter">
                        UNFOLDING______DRAMA_______AND______ART_____FOR____NATION
                    </span>
                    <span className="text-4xl md:text-5xl font-serif italic text-white mx-4 tracking-tighter">
                        UNFOLDING______DRAMA_______AND______ART_____FOR____NATION
                    </span>
                </div>
            </div>
        </header>
    );
};

export default HeroSection;
