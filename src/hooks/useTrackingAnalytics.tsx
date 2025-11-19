import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const useTrackingAnalytics = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['tracking-analytics', dateRange],
    queryFn: async () => {
      const from = startOfDay(dateRange.from).toISOString();
      const to = endOfDay(dateRange.to).toISOString();

      // Fetch tracking events
      const { data: events, error: eventsError } = await supabase
        .from('user_tracking_events')
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('started_at', from)
        .lte('started_at', to)
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversion_events')
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false });

      if (conversionsError) throw conversionsError;

      // Fetch journey data
      const { data: journeys, error: journeysError } = await supabase
        .from('user_journey')
        .select('*')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false });

      if (journeysError) throw journeysError;

      // Calculate metrics
      const totalEvents = events?.length || 0;
      const totalSessions = sessions?.length || 0;
      const totalConversions = conversions?.length || 0;
      const uniqueUsers = new Set(events?.map(e => e.user_id).filter(Boolean)).size;

      // Event type distribution
      const eventTypeDistribution = events?.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Top pages
      const pageViews = events?.filter(e => e.event_type === 'page_view') || [];
      const topPages = pageViews.reduce((acc, event) => {
        const url = new URL(event.page_url).pathname;
        acc[url] = (acc[url] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPagesList = Object.entries(topPages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }));

      // Device distribution
      const deviceDistribution = events?.reduce((acc, event) => {
        if (event.device_type) {
          acc[event.device_type] = (acc[event.device_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Browser distribution
      const browserDistribution = events?.reduce((acc, event) => {
        if (event.browser) {
          acc[event.browser] = (acc[event.browser] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Average session duration (calculate from created_at to expires_at)
      const avgSessionDuration = sessions?.reduce((sum, s) => {
        const created = new Date(s.created_at).getTime();
        const expires = new Date(s.expires_at).getTime();
        const duration = (expires - created) / 1000; // Convert to seconds
        return sum + duration;
      }, 0) / (sessions?.length || 1);

      // Traffic sources (UTM)
      const trafficSources = events?.reduce((acc, event) => {
        const source = event.utm_source || 'direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Conversion rate
      const conversionRate = totalSessions > 0 
        ? (totalConversions / totalSessions) * 100 
        : 0;

      // Conversion types
      const conversionTypes = conversions?.reduce((acc, conv) => {
        acc[conv.conversion_type] = (acc[conv.conversion_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Daily trend
      const dailyTrend = events?.reduce((acc, event) => {
        const date = format(new Date(event.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = { date, events: 0, sessions: 0, conversions: 0 };
        }
        acc[date].events += 1;
        return acc;
      }, {} as Record<string, { date: string; events: number; sessions: number; conversions: number }>) || {};

      // Add sessions to daily trend
      sessions?.forEach(session => {
        const date = format(new Date(session.created_at), 'yyyy-MM-dd');
        if (dailyTrend[date]) {
          dailyTrend[date].sessions += 1;
        }
      });

      // Add conversions to daily trend
      conversions?.forEach(conv => {
        const date = format(new Date(conv.created_at), 'yyyy-MM-dd');
        if (dailyTrend[date]) {
          dailyTrend[date].conversions += 1;
        }
      });

      const dailyTrendArray = Object.values(dailyTrend).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Top businesses viewed
      const businessViews = events?.filter(e => e.event_type === 'business_view') || [];
      const topBusinesses = businessViews.reduce((acc, event) => {
        if (event.empresa_id) {
          if (!acc[event.empresa_id]) {
            const metadata = event.metadata as any;
            acc[event.empresa_id] = {
              id: event.empresa_id,
              name: metadata?.empresa_nome || 'Unknown',
              views: 0,
            };
          }
          acc[event.empresa_id].views += 1;
        }
        return acc;
      }, {} as Record<string, { id: string; name: string; views: number }>);

      const topBusinessesList = Object.values(topBusinesses)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Search analytics
      const searches = events?.filter(e => e.event_type === 'search') || [];
      const topSearchTerms = searches.reduce((acc, event) => {
        const metadata = event.metadata as any;
        const term = metadata?.search_term;
        if (term) {
          acc[term] = (acc[term] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topSearchTermsList = Object.entries(topSearchTerms)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([term, count]) => ({ term, count }));

      return {
        overview: {
          totalEvents,
          totalSessions,
          totalConversions,
          uniqueUsers,
          avgSessionDuration: Math.round(avgSessionDuration),
          conversionRate: conversionRate.toFixed(2),
        },
        eventTypeDistribution,
        topPages: topPagesList,
        deviceDistribution,
        browserDistribution,
        trafficSources,
        conversionTypes,
        dailyTrend: dailyTrendArray,
        topBusinesses: topBusinessesList,
        topSearchTerms: topSearchTermsList,
        rawData: {
          events,
          sessions,
          conversions,
          journeys,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
