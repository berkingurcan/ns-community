import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useLazyLoading<T>(
  items: T[],
  itemsPerPage: number = 10,
  options: UseLazyLoadingOptions = {}
) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simulate network delay for smooth UX
    setTimeout(() => {
      const currentLength = visibleItems.length;
      const nextItems = items.slice(currentLength, currentLength + itemsPerPage);
      
      setVisibleItems(prev => [...prev, ...nextItems]);
      setHasMore(currentLength + nextItems.length < items.length);
      setIsLoading(false);
    }, 100);
  }, [items, visibleItems.length, itemsPerPage, isLoading, hasMore]);

  useEffect(() => {
    // Reset when items change
    const initialItems = items.slice(0, itemsPerPage);
    setVisibleItems(initialItems);
    setHasMore(initialItems.length < items.length);
  }, [items, itemsPerPage]);

  useEffect(() => {
    const { threshold = 0.1, rootMargin = '50px' } = options;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold, rootMargin }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    return () => {
      if (observerRef.current && currentSentinel) {
        observerRef.current.unobserve(currentSentinel);
      }
    };
  }, [loadMore, options]);

  return {
    visibleItems,
    hasMore,
    isLoading,
    sentinelRef,
    loadMore
  };
}