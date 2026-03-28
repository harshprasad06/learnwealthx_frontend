'use client';

export function BlogImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}
