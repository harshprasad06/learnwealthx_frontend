'use client';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-base', gap: 'gap-2.5', letterSpacing: 'tracking-tight' },
    md: { icon: 'w-9 h-9', text: 'text-xl', gap: 'gap-3', letterSpacing: 'tracking-tight' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', gap: 'gap-3.5', letterSpacing: 'tracking-tight' },
  };

  const { icon: iconSize, text: textSize, gap, letterSpacing } = sizeClasses[size];

  return (
    <div className={`inline-flex items-center ${gap} group ${className}`}>
      {/* Premium Minimal Icon - Like Udemy/Byju's Style */}
      <div className={`${iconSize} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="lwxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Clean Rounded Square - Modern & Premium */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            rx="18"
            fill="url(#lwxGrad)"
            className="group-hover:opacity-95 transition-opacity duration-300"
          />

          {/* Minimal LWX Monogram - Clean Lines */}
          <g stroke="white" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* L */}
            <path d="M25 30 L25 60 L42 60" strokeWidth="6.5" />
            
            {/* W */}
            <path d="M50 30 L56 50 L62 35 L68 50 L74 30" strokeWidth="6" />
            
            {/* X */}
            <path d="M80 35 L88 43 M88 35 L80 43" strokeWidth="5.5" />
          </g>
        </svg>
      </div>
      
      {/* Premium Typography - Clean & Professional */}
      {showText && (
        <span className={`font-bold ${textSize} ${letterSpacing} leading-tight text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300`}>
          LearnWealth<span className="font-black bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">X</span>
        </span>
      )}
    </div>
  );
}
