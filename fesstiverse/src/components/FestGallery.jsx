import React from 'react';

const galleryImages = [
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg',
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
    'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/5bab247f-35d9-400d-a82b-fd87cfe913d2_1600w.webp',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80',
];

const FestGallery = () => {
    return (
        <section id="gallery" className="py-20">
            <h2 className="text-center text-2xl font-bold mb-8 text-purple-200">Past Glimpses</h2>
            <div className="flex overflow-hidden space-x-4 h-64">
                <div className="flex animate-marquee gap-4">
                    {galleryImages.map((src, i) => (
                        <img key={`a-${i}`} src={src} className="rounded-lg h-full object-cover" alt="Past event" />
                    ))}
                    {galleryImages.map((src, i) => (
                        <img key={`b-${i}`} src={src} className="rounded-lg h-full object-cover" alt="Past event" />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FestGallery;
