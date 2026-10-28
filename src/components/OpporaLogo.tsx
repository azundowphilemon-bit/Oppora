import React from 'react';

export function OpporaLogo({
  size = 'md',
  lightText = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  lightText?: boolean;
}) {
  const dimensions =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textClasses =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-2xl'
      : 'text-xl';

  return (
    <div className="inline-flex items-center gap-3 select-none group">
      <div
        className={`${dimensions} relative rounded-xl bg-gradient-to-br from-clay-600 via-clay-700 to-forest-800 p-0.5 shadow-warm-sm transition-transform duration-200 group-hover:scale-105`}
      >
        <div className="w-full h-full rounded-[10px] bg-charcoal-900 flex items-center justify-center relative overflow-hidden">
          {/* Custom African Adinkra / Interconnected Community & Shelter Geometric Emblem */}
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5"
            aria-hidden="true"
          >
            {/* Outer diamond of community shelter */}
            <path
              d="M20 4L35 20L20 36L5 20L20 4Z"
              stroke="#E5B23A"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Four cardinal warmth nodes (North, East, South, West across Africa) */}
            <circle cx="20" cy="11" r="2.3" fill="#C85A32" />
            <circle cx="29" cy="20" r="2.3" fill="#236B4E" />
            <circle cx="20" cy="29" r="2.3" fill="#C85A32" />
            <circle cx="11" cy="20" r="2.3" fill="#236B4E" />
            {/* Central rising sun / open doorway of opportunity */}
            <path
              d="M15.5 23.5V18.5C15.5 16.0147 17.5147 14 20 14C22.4853 14 24.5 16.0147 24.5 18.5V23.5H15.5Z"
              fill="#F5DD95"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-display font-bold tracking-tight leading-none ${textClasses} ${
            lightText ? 'text-ivory-50' : 'text-charcoal-900'
          }`}
        >
          Oppora
        </span>
        <span
          className={`text-[10px] uppercase tracking-[0.18em] font-semibold mt-0.5 ${
            lightText ? 'text-gold-200' : 'text-clay-600'
          }`}
        >
          Ghana Community
        </span>
      </div>
    </div>
  );
}

export function KenteAccentBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-full h-1.5 flex overflow-hidden rounded-full ${className}`}
      aria-hidden="true"
    >
      <div className="flex-1 bg-clay-600" />
      <div className="w-8 bg-gold-400" />
      <div className="flex-1 bg-forest-600" />
      <div className="w-8 bg-charcoal-900" />
      <div className="flex-1 bg-gold-500" />
      <div className="w-8 bg-clay-500" />
      <div className="flex-1 bg-forest-700" />
    </div>
  );
}
