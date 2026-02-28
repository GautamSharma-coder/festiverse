import React from 'react';

const sponsors = ['Sponsored by TechGiant', 'Café Chai', 'Coding Ninjas', 'Unacademy', 'RedBull'];

const SponsorMarquee = () => {
    return (
        <div className="bg-purple-900/10 border-y border-purple-500/20 py-4 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap gap-16 text-zinc-500 font-bold uppercase tracking-wider text-sm">
                {sponsors.map((s, i) => (
                    <span key={`a-${i}`}>{s}</span>
                ))}
                {sponsors.map((s, i) => (
                    <span key={`b-${i}`}>{s}</span>
                ))}
            </div>
        </div>
    );
};

export default SponsorMarquee;
