'use client';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', showText = false, size = 'md' }: LogoProps) {
  /**
   * SIZED BY HEIGHT, WITH THE WIDTH LEFT TO THE ARTWORK.
   *
   * These used to be fixed SQUARES of 128-160px, inside a navbar only 64-80px
   * tall. That overflowed the header the whole time; it was invisible only
   * because the old logo was a transparent PNG whose mark floated in a large
   * empty canvas, so the oversized box had nothing to show. The moment the file
   * became a solid tile, the real box appeared and spilled out of the bar.
   *
   * The mark is 1.73:1, so constraining HEIGHT and letting width follow keeps
   * it inside the navbar at any breakpoint and keeps the wordmark legible —
   * squeezing a wide lockup into a square would have shrunk it to fit the
   * narrower dimension and left the text unreadable.
   *
   * Heights are chosen against the navbar's own `h-16 sm:h-20`.
   */
  const sizeClasses = {
    sm: { icon: 'h-7 sm:h-8', text: 'text-base', gap: 'gap-2.5', letterSpacing: 'tracking-tight' },
    md: { icon: 'h-9 sm:h-11', text: 'text-xl', gap: 'gap-3', letterSpacing: 'tracking-tight' },
    lg: { icon: 'h-11 sm:h-14', text: 'text-2xl', gap: 'gap-3.5', letterSpacing: 'tracking-tight' },
  };

  const { icon: iconSize, text: textSize, gap, letterSpacing } = sizeClasses[size];

  return (
    <div className={`inline-flex items-center ${showText ? gap : ''} group ${className}`}>
      {/* Logo Image - Responsive and Dark Mode Compatible */}
      <div className={`${iconSize} relative flex-shrink-0 ${className}`}>
        <img
          src="/logo.png"
          alt="LearnWealthX Logo"
          // `h-full w-auto`, not `w-full h-full`: the width must follow the
          // artwork's own ratio. Forcing both would letterbox a wide mark
          // inside a square and waste most of the space.
          className="h-full w-auto object-contain rounded-md transition-all duration-300"
          style={{
            backgroundColor: 'transparent',
            background: 'transparent',
            mixBlendMode: 'normal',
            imageRendering: 'auto',
            display: 'block',
          }}
          onError={(e) => {
            // Fallback to SVG if image not found
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        
        {/* Fallback SVG (if logo image not found) */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full hidden"
          style={{ display: 'none' }}
        >
          <defs>
            <linearGradient id="lwxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="18"
            fill="url(#lwxGrad)"
            className="group-hover:opacity-95 transition-opacity duration-300"
          />
          <g stroke="white" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M25 30 L25 60 L42 60" strokeWidth="6.5" />
            <path d="M50 30 L56 50 L62 35 L68 50 L74 30" strokeWidth="6" />
            <path d="M80 35 L88 43 M88 35 L80 43" strokeWidth="5.5" />
          </g>
        </svg>
      </div>
      
      {/* Premium Typography - Only shown if showText is true */}
      {showText && (
        <span className={`font-bold ${textSize} ${letterSpacing} leading-tight text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-ink-50 transition-colors duration-300`}>
          LearnWealth<span className="font-black bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-mint-300 dark:to-mint-500 bg-clip-text text-transparent">X</span>
        </span>
      )}
    </div>
  );
}
