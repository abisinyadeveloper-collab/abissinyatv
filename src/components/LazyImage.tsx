import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80';

const LazyImage = memo(({ src, alt, className, placeholderClassName }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // Load earlier for smoother scrolling
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imageSrc = hasError || !src ? DEFAULT_PLACEHOLDER : src;

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-muted", className)}>
      {/* Skeleton placeholder */}
      <div
        className={cn(
          "absolute inset-0 bg-muted animate-pulse transition-opacity duration-200",
          placeholderClassName,
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      />
      
      {/* Actual image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
