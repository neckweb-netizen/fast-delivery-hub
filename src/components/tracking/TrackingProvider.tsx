import { useEffect } from 'react';
import { useUserTracking } from '@/hooks/useUserTracking';

export const TrackingProvider = ({ children }: { children: React.ReactNode }) => {
  const { trackClick } = useUserTracking();

  useEffect(() => {
    // Track all clicks globally
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementId = target.id;
      const elementClass = target.className;
      const elementText = target.textContent?.slice(0, 100); // Limit text length
      const position = { x: e.clientX, y: e.clientY };

      trackClick(elementId, elementClass, elementText, position);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [trackClick]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the page
        console.log('User left page');
      } else {
        // User returned to page
        console.log('User returned to page');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return <>{children}</>;
};
