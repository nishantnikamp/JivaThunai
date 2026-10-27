import React from 'react';

import img1 from '../assets/pupp.jpg';
import img2 from '../assets/puppy.jpg';
import img3 from '../assets/kf.jpg';
import img4 from '../assets/hamster.jpeg';
import img5 from '../assets/hamster fm.jpg';
import img6 from '../assets/green parrot.jpeg';
import img7 from '../assets/dog 1.jpg';
import img8 from '../assets/cat 3.jpg';
import img9 from '../assets/cat 2.jpg';
import img10 from '../assets/cat 1.jpg';
import img11 from '../assets/bird 1.jpg';
import img12 from '../assets/b.jpg';
import img13 from '../assets/African pygmy hedgehog.jpeg';
import img14 from '../assets/bird color.webp';
import img15 from '../assets/black dog.jpeg';
import img17 from '../assets/duck.jpeg';
import img18 from '../assets/kitten.jpeg';
import img19 from '../assets/rabbit.jpeg';
import img20 from '../assets/squirrel.jpeg';
import img21 from '../assets/swan.jpg';
import img22 from '../assets/rio bird.jpg';
import img23 from '../assets/white dog.jpeg';
import img24 from '../assets/tortoise.jpeg';
import img25 from '../assets/lake tortoise.jpg';
import img26 from '../assets/fish.jpeg';
import img27 from '../assets/fish red.jpeg';
import img29 from '../assets/dog.jpeg';

export const HeroMarqueePanel = () => {
  const col1Images = [
    { src: img1, alt: 'Puppy', className: 'w-48 h-64' },
    { src: img2, alt: 'Puppy', className: 'w-48 h-48' },
    { src: img3, alt: 'Kf', className: 'w-48 h-56' },
    { src: img4, alt: 'Hamster', className: 'w-48 h-72' },
    { src: img5, alt: 'Hamster FM', className: 'w-48 h-48' },
    { src: img6, alt: 'Green Parrot', className: 'w-48 h-64' },
    { src: img7, alt: 'Dog 1', className: 'w-48 h-80' },
    { src: img8, alt: 'Cat 3', className: 'w-48 h-56' },
    { src: img9, alt: 'Cat 2', className: 'w-48 h-64' },
    { src: img10, alt: 'Cat 1', className: 'w-48 h-48' },
  ];

  const col2Images = [
    { src: img11, alt: 'Bird 1', className: 'w-48 h-72' },
    { src: img12, alt: 'B', className: 'w-48 h-56' },
    { src: img13, alt: 'Hedgehog', className: 'w-48 h-80' },
    { src: img14, alt: 'Bird Color', className: 'w-48 h-64' },
    { src: img15, alt: 'Black Dog', className: 'w-48 h-48' },
    { src: img14, alt: 'Bird Color', className: 'w-48 h-56' },
    { src: img17, alt: 'Duck', className: 'w-48 h-72' },
    { src: img18, alt: 'Kitten', className: 'w-48 h-48' },
    { src: img19, alt: 'Rabbit', className: 'w-48 h-64' },
  ];

  const col3Images = [
    { src: img20, alt: 'Squirrel', className: 'w-48 h-80' },
    { src: img21, alt: 'Swan', className: 'w-48 h-56' },
    { src: img22, alt: 'Rio Bird', className: 'w-48 h-64' },
    { src: img23, alt: 'White Dog', className: 'w-48 h-48' },
    { src: img24, alt: 'Tortoise', className: 'w-48 h-72' },
    { src: img25, alt: 'Lake Tortoise', className: 'w-48 h-56' },
    { src: img26, alt: 'Fish', className: 'w-48 h-80' },
    { src: img27, alt: 'Fish Red', className: 'w-48 h-64' },
    { src: img17, alt: 'Duck', className: 'w-48 h-48' },
    { src: img29, alt: 'Dog', className: 'w-48 h-56' }
  ];

  return (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 relative overflow-hidden items-center justify-center">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-start justify-center gap-4 h-[150%] -rotate-6 scale-[1.15] mask-image-vertical-fade">
        {/* Column 1 */}
        <div className="flex flex-col animate-marquee-fast shrink-0">
          <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }}>
            {col1Images.map((img, idx) => (
              <img key={`c1-${idx}`} src={img.src} alt={img.alt} className={`${img.className} shrink-0 object-cover rounded-2xl shadow-lg border border-emerald-500/20`} />
            ))}
          </div>
          <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }} aria-hidden="true">
            {col1Images.map((img, idx) => (
              <img key={`c1-dup-${idx}`} src={img.src} alt={img.alt} className={`${img.className} shrink-0 object-cover rounded-2xl shadow-lg border border-emerald-500/20`} />
            ))}
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col animate-marquee-medium mt-12 shrink-0">
          <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }}>
            {col2Images.map((img, idx) => (
              <img key={`c2-${idx}`} src={img.src} alt={img.alt} className={`${img.className} shrink-0 object-cover rounded-2xl shadow-lg border border-emerald-500/20`} />
            ))}
          </div>
          <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }} aria-hidden="true">
            {col2Images.map((img, idx) => (
              <img key={`c2-dup-${idx}`} src={img.src} alt={img.alt} className={`${img.className} shrink-0 object-cover rounded-2xl shadow-lg border border-emerald-500/20`} />
            ))}
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col animate-marquee-slow mt-4 shrink-0">
          <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }}>
            {col3Images.map((img, idx) => (
              <img key={`c3-${idx}`} src={img.src} alt={img.alt} className={`${img.className} shrink-0 object-cover rounded-2xl shadow-lg border border-emerald-500/20`} />
            ))}
          </div>
          <div className="flex flex-col shrink-0" style={{ gap: '1rem', paddingBottom: '1rem' }} aria-hidden="true">
            {col3Images.map((img, idx) => (
              <img key={`c3-dup-${idx}`} src={img.src} alt={img.alt} className={`${img.className} shrink-0 object-cover rounded-2xl shadow-lg border border-emerald-500/20`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
