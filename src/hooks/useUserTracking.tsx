import { useCallback, useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

export const useUserTracking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sessionData, setSessionData] = useState<any>(null);
  const pageStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const sessionId = sessionStorage.getItem('tracking_session_id') || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tracking_session_id', sessionId);
    setSessionData({ session_id: sessionId, started_at: new Date(), entry_url: window.location.href });
  }, []);

  useEffect(() => {
    pageStartTime.current = Date.now();
  }, [location.pathname]);

  // All tracking functions are no-ops since tables don't exist
  const trackEvent = useCallback(async (_event: any) => {}, []);
  const trackJourneyStep = useCallback(async (_step: any) => {}, []);
  const trackConversion = useCallback(async (_data: any) => {}, []);
  const trackClick = useCallback((_id?: string, _cls?: string, _txt?: string, _pos?: any) => {}, []);
  const trackSearch = useCallback((_term: string, _count?: number) => {}, []);
  const trackBusinessView = useCallback((_id: string, _name: string) => {}, []);
  const trackProductView = useCallback((_pid: string, _pname: string, _eid: string) => {}, []);
  const trackCouponView = useCallback((_cid: string, _title: string, _eid: string) => {}, []);
  const trackEventView = useCallback((_eid: string, _title: string) => {}, []);

  return {
    trackEvent, trackJourneyStep, trackConversion, trackClick,
    trackSearch, trackBusinessView, trackProductView, trackCouponView, trackEventView,
    sessionData,
  };
};
