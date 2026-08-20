import React from 'react';

export default function VibeDoodle({ type, className = '', size = 52 }) {
  const baseSvgProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 64 64',
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { display: 'block' },
  };

  const getDoodle = () => {
    switch (type) {
      case 'coffee-stroll':
        return (
          <svg {...baseSvgProps} className="text-[var(--blue)]">
            {/* Takeaway Coffee Cup */}
            <path d="M18 16l4 34c0.5 4 4 6 8 6h4c4 0 7.5-2 8-6l4-34" />
            <path d="M14 16h36" />
            <path d="M16 10h32v6H16z" />
            {/* Sleeves */}
            <path d="M19 26h26" />
            <path d="M21 38h22" />
            {/* Swirling Steam / Leaves */}
            <path d="M26 6c1-2 3-2 4 0s-1 4-4 4" />
            <path d="M34 5c1-2 2-2 3 0s-1 3-3 3" />
          </svg>
        );
      case 'board-games':
        return (
          <svg {...baseSvgProps} className="text-[var(--orange)]">
            {/* Tilted Die 1 */}
            <rect x="8" y="18" width="28" height="28" rx="5" transform="rotate(-8 22 32)" />
            {/* Tilted Die 2 (Overlaying) */}
            <rect x="32" y="14" width="24" height="24" rx="4" transform="rotate(12 44 26)" />
            {/* Dots Die 1 */}
            <circle cx="16" cy="27" r="1.5" fill="currentColor" />
            <circle cx="28" cy="39" r="1.5" fill="currentColor" />
            <circle cx="22" cy="33" r="1.5" fill="currentColor" />
            {/* Dots Die 2 */}
            <circle cx="44" cy="26" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'pottery-workshop':
        return (
          <svg {...baseSvgProps} className="text-[var(--olive)]">
            {/* Clay Vase */}
            <path d="M14 16c2-4 8-4 10 0v8c0 5-6 8-6 12v6c0 4 3 6 8 6h4c5 0 8-2 8-6v-6c0-4-6-7-6-12v-8c2-4 8-4 10 0" />
            <path d="M18 42h20" />
            <path d="M20 28h16" />
            {/* Wine Glass */}
            <path d="M46 16v18c0 5 4 8 8 8s8-3 8-8V16H46z" />
            <path d="M54 42v10" />
            <path d="M48 52h12" />
          </svg>
        );
      case 'outdoor-walk':
        return (
          <svg {...baseSvgProps} className="text-emerald-700">
            {/* Wave / Cliff Lines */}
            <path d="M6 46c10-4 16-8 26-2s12 6 26-2" />
            {/* Pine Tree */}
            <path d="M22 46V18" />
            <path d="M12 36l10-10 10 10H12z" />
            <path d="M14 28l8-8 8 8H14z" />
            {/* Tiny Sun */}
            <circle cx="48" cy="18" r="6" />
            <path d="M48 6v2" />
            <path d="M60 18h-2" />
          </svg>
        );
      case 'dinner-out':
        return (
          <svg {...baseSvgProps} className="text-[var(--hot)]">
            {/* Plate Circle */}
            <circle cx="32" cy="32" r="24" />
            <circle cx="32" cy="32" r="15" strokeDasharray="6 4" />
            {/* Fork */}
            <path d="M14 20v14m0 0v10m-3-10h6m-6-10v5m6-5v5" />
            {/* Knife */}
            <path d="M50 20v14m0 0v10m-3-10c0-10 3-10 3-10s3 0 3 10h-6" />
          </svg>
        );
      case 'retreat':
        return (
          <svg {...baseSvgProps} className="text-[var(--pink)]">
            {/* Mountains */}
            <path d="M8 50l16-24 12 18 16-26 10 16" />
            <path d="M4 50h56" />
            {/* Sun Rays */}
            <circle cx="32" cy="18" r="5" />
            <path d="M22 18h2" />
            <path d="M40 18h2" />
            <path d="M32 8v2" />
          </svg>
        );
      default:
        return (
          <svg {...baseSvgProps} className="text-gray-500">
            <circle cx="32" cy="32" r="20" />
            <path d="M32 20v24M20 32h24" />
          </svg>
        );
    }
  };

  return (
    <span className={`inline-grid place-items-center bg-[var(--paper)] border-2 border-[var(--ink)] rounded-[13px_15px_11px_16px] shadow-[3px_3px_0px_var(--ink)] p-2.5 transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_var(--ink)] ${className}`}>
      {getDoodle()}
    </span>
  );
}
