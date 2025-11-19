import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

interface TrackingEvent {
  event_type: string;
  event_name: string;
  page_url: string;
  page_title?: string;
  referrer?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  click_position?: { x: number; y: number };
  empresa_id?: string;
  produto_id?: string;
  evento_id?: string;
  cupom_id?: string;
  metadata?: Record<string, any>;
  page_load_time?: number;
  time_on_page?: number;
  scroll_depth?: number;
}

interface SessionData {
  session_id: string;
  started_at: Date;
  entry_url: string;
  entry_referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export const useUserTracking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [journeyStep, setJourneyStep] = useState(0);
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const lastPageUrl = useRef<string>('');

  // Generate or retrieve session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('tracking_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Get device information
  const getDeviceInfo = useCallback(() => {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    let browser = 'unknown';
    let os = 'unknown';

    // Detect device type
    if (/mobile/i.test(ua)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

    // Detect browser
    if (/chrome/i.test(ua)) browser = 'Chrome';
    else if (/firefox/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';
    else if (/edge/i.test(ua)) browser = 'Edge';
    else if (/opera/i.test(ua)) browser = 'Opera';

    // Detect OS
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac/i.test(ua)) os = 'MacOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

    return {
      device_type: deviceType,
      browser,
      os,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      user_agent: ua,
    };
  }, []);

  // Extract UTM parameters
  const getUtmParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
  }, []);

  // Initialize session
  useEffect(() => {
    const sessionId = getSessionId();
    const utmParams = getUtmParams();
    
    const session: SessionData = {
      session_id: sessionId,
      started_at: new Date(),
      entry_url: window.location.href,
      entry_referrer: document.referrer,
      ...utmParams,
    };
    
    setSessionData(session);

    // Store UTM params in session storage for attribution
    if (utmParams.utm_source) {
      sessionStorage.setItem('first_touch_source', utmParams.utm_source);
      sessionStorage.setItem('last_touch_source', utmParams.utm_source);
    }
  }, [getSessionId, getUtmParams]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollDepth = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
      
      if (scrollDepth > maxScrollDepth.current) {
        maxScrollDepth.current = scrollDepth;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track page view on route change
  useEffect(() => {
    if (!sessionData) return;

    const currentUrl = window.location.href;
    const timeOnPreviousPage = Date.now() - pageStartTime.current;

    // Track previous page time if it's not the first page
    if (lastPageUrl.current && lastPageUrl.current !== currentUrl) {
      trackEvent({
        event_type: 'page_exit',
        event_name: 'page_exit',
        page_url: lastPageUrl.current,
        time_on_page: Math.round(timeOnPreviousPage / 1000),
        scroll_depth: maxScrollDepth.current,
      });
    }

    // Track new page view
    trackEvent({
      event_type: 'page_view',
      event_name: 'page_view',
      page_url: currentUrl,
      page_title: document.title,
      referrer: lastPageUrl.current || document.referrer,
    });

    // Track journey step
    trackJourneyStep({
      page_url: currentUrl,
      page_title: document.title,
      action_taken: 'navigate',
    });

    // Reset tracking state
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;
    lastPageUrl.current = currentUrl;
    setJourneyStep(prev => prev + 1);

  }, [location.pathname, sessionData]);

  // Track event
  const trackEvent = useCallback(async (event: Partial<TrackingEvent>) => {
    if (!sessionData) return;

    try {
      const deviceInfo = getDeviceInfo();
      const utmParams = getUtmParams();

      const fullEvent = {
        session_id: sessionData.session_id,
        user_id: user?.id || null,
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        event_type: event.event_type || 'custom',
        event_name: event.event_name || 'custom_event',
        ...deviceInfo,
        ...utmParams,
        ...event,
        created_at: new Date().toISOString(),
      };

      await supabase.from('user_tracking_events').insert([fullEvent] as any);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [sessionData, user, getDeviceInfo, getUtmParams]);

  // Track journey step
  const trackJourneyStep = useCallback(async (stepData: {
    page_url: string;
    page_title: string;
    action_taken: string;
    metadata?: Record<string, any>;
  }) => {
    if (!sessionData) return;

    try {
      await supabase.from('user_journey').insert([{
        session_id: sessionData.session_id,
        user_id: user?.id || null,
        step_number: journeyStep,
        ...stepData,
        timestamp: new Date().toISOString(),
      }] as any);
    } catch (error) {
      console.error('Error tracking journey:', error);
    }
  }, [sessionData, user, journeyStep]);

  // Track conversion
  const trackConversion = useCallback(async (conversionData: {
    conversion_type: string;
    conversion_value?: number;
    empresa_id?: string;
    produto_id?: string;
    evento_id?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!sessionData) return;

    try {
      const firstTouch = sessionStorage.getItem('first_touch_source') || 'direct';
      const lastTouch = sessionStorage.getItem('last_touch_source') || 'direct';

      await supabase.from('conversion_events').insert([{
        session_id: sessionData.session_id,
        user_id: user?.id || null,
        first_touch_source: firstTouch,
        last_touch_source: lastTouch,
        attribution_model: 'last_touch',
        ...conversionData,
        created_at: new Date().toISOString(),
      }] as any);
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }, [sessionData, user]);

  // Track click
  const trackClick = useCallback((
    elementId?: string,
    elementClass?: string,
    elementText?: string,
    position?: { x: number; y: number }
  ) => {
    trackEvent({
      event_type: 'click',
      event_name: 'user_click',
      element_id: elementId,
      element_class: elementClass,
      element_text: elementText,
      click_position: position,
    });
  }, [trackEvent]);

  // Track search
  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    trackEvent({
      event_type: 'search',
      event_name: 'search_performed',
      metadata: {
        search_term: searchTerm,
        results_count: resultsCount,
      },
    });
  }, [trackEvent]);

  // Track business view
  const trackBusinessView = useCallback((empresaId: string, empresaNome: string) => {
    trackEvent({
      event_type: 'business_view',
      event_name: 'view_business',
      empresa_id: empresaId,
      metadata: { empresa_nome: empresaNome },
    });
  }, [trackEvent]);

  // Track product view
  const trackProductView = useCallback((produtoId: string, produtoNome: string, empresaId: string) => {
    trackEvent({
      event_type: 'product_view',
      event_name: 'view_product',
      produto_id: produtoId,
      empresa_id: empresaId,
      metadata: { produto_nome: produtoNome },
    });
  }, [trackEvent]);

  // Track coupon view
  const trackCouponView = useCallback((cupomId: string, cupomTitulo: string, empresaId: string) => {
    trackEvent({
      event_type: 'coupon_view',
      event_name: 'view_coupon',
      cupom_id: cupomId,
      empresa_id: empresaId,
      metadata: { cupom_titulo: cupomTitulo },
    });
  }, [trackEvent]);

  // Track event view
  const trackEventView = useCallback((eventoId: string, eventoTitulo: string) => {
    trackEvent({
      event_type: 'event_view',
      event_name: 'view_event',
      evento_id: eventoId,
      metadata: { evento_titulo: eventoTitulo },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackJourneyStep,
    trackConversion,
    trackClick,
    trackSearch,
    trackBusinessView,
    trackProductView,
    trackCouponView,
    trackEventView,
    sessionData,
  };
};
