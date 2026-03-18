import { useQuery } from '@tanstack/react-query';

export const useTrackingAnalytics = (dateRange: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['tracking-analytics', dateRange],
    queryFn: async () => {
      // Tracking tables don't exist in schema, return empty data
      return {
        overview: {
          totalEvents: 0,
          totalSessions: 0,
          totalConversions: 0,
          uniqueUsers: 0,
          avgSessionDuration: 0,
          conversionRate: '0.00',
        },
        eventTypeDistribution: {},
        topPages: [],
        deviceDistribution: {},
        browserDistribution: {},
        trafficSources: {},
        conversionTypes: {},
        dailyTrend: [],
        topBusinesses: [],
        topSearchTerms: [],
        rawData: {
          events: [],
          sessions: [],
          conversions: [],
          journeys: [],
        },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};
