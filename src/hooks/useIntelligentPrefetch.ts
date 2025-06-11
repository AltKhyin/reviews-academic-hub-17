
// ABOUTME: Intelligent prefetching system based on user behavior patterns
import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface NavigationPattern {
  fromRoute: string;
  toRoute: string;
  frequency: number;
  lastVisited: Date;
}

interface PrefetchRule {
  currentRoute: string;
  prefetchRoute: string;
  confidence: number;
  queryKey: string[];
  queryFn: () => Promise<any>;
}

interface BehaviorPattern {
  routeSequence: string[];
  frequency: number;
  avgTimeSpent: number;
}

export const useIntelligentPrefetch = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const [navigationPatterns, setNavigationPatterns] = useState<NavigationPattern[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [prefetchRules, setPrefetchRules] = useState<PrefetchRule[]>([]);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  
  const [visitHistory, setVisitHistory] = useState<{route: string; timestamp: Date}[]>([]);
  const [routeStartTime, setRouteStartTime] = useState<Date>(new Date());

  // Track route changes and build patterns
  useEffect(() => {
    const currentRoute = location.pathname;
    const now = new Date();
    
    // Calculate time spent on previous route
    if (visitHistory.length > 0) {
      const timeSpent = now.getTime() - routeStartTime.getTime();
      
      // Update behavior patterns
      setBehaviorPatterns(prev => {
        const sequence = visitHistory.slice(-2).map(v => v.route).concat(currentRoute);
        const existing = prev.find(p => 
          JSON.stringify(p.routeSequence) === JSON.stringify(sequence)
        );
        
        if (existing) {
          return prev.map(p => 
            p === existing 
              ? { ...p, frequency: p.frequency + 1, avgTimeSpent: (p.avgTimeSpent + timeSpent) / 2 }
              : p
          );
        } else {
          return [...prev, {
            routeSequence: sequence,
            frequency: 1,
            avgTimeSpent: timeSpent,
          }];
        }
      });
    }

    // Add to visit history
    setVisitHistory(prev => [
      ...prev.slice(-9), // Keep last 10 visits
      { route: currentRoute, timestamp: now }
    ]);
    
    setRouteStartTime(now);
  }, [location.pathname, visitHistory, routeStartTime]);

  // Generate prefetch rules based on patterns
  const generatePrefetchRules = useCallback(() => {
    const rules: PrefetchRule[] = [];
    
    // Rule 1: Archive -> Review prefetching
    if (location.pathname === '/acervo') {
      rules.push({
        currentRoute: '/acervo',
        prefetchRoute: '/review/*',
        confidence: 0.8,
        queryKey: ['sidebar-stats'],
        queryFn: async () => {
          const { data } = await supabase.rpc('get_sidebar_stats');
          return data;
        },
      });
    }

    // Rule 2: Homepage -> Archive prefetching
    if (location.pathname === '/') {
      const archivePattern = navigationPatterns.find(p => 
        p.fromRoute === '/' && p.toRoute === '/acervo'
      );
      
      if (archivePattern && archivePattern.frequency > 2) {
        rules.push({
          currentRoute: '/',
          prefetchRoute: '/acervo',
          confidence: Math.min(archivePattern.frequency / 10, 0.9),
          queryKey: ['archive-metadata'],
          queryFn: async () => {
            const { data } = await supabase.rpc('get_archive_metadata');
            return data;
          },
        });
      }
    }

    // Rule 3: Based on behavior patterns
    behaviorPatterns.forEach(pattern => {
      if (pattern.frequency > 3 && pattern.routeSequence.length >= 2) {
        const currentIdx = pattern.routeSequence.findIndex(route => route === location.pathname);
        if (currentIdx >= 0 && currentIdx < pattern.routeSequence.length - 1) {
          const nextRoute = pattern.routeSequence[currentIdx + 1];
          const confidence = Math.min(pattern.frequency / 20, 0.85);
          
          rules.push({
            currentRoute: location.pathname,
            prefetchRoute: nextRoute,
            confidence,
            queryKey: ['prefetch', nextRoute],
            queryFn: () => Promise.resolve({}), // Placeholder
          });
        }
      }
    });

    setPrefetchRules(rules);
    
    // Set confidence for next route prediction
    const highestConfidence = Math.max(...rules.map(r => r.confidence), 0);
    setCurrentConfidence(highestConfidence);
    
  }, [location.pathname, navigationPatterns, behaviorPatterns]);

  // Execute prefetching based on rules
  const executePrefetch = useCallback(async () => {
    const applicableRules = prefetchRules.filter(rule => 
      rule.currentRoute === location.pathname && rule.confidence > 0.5
    );

    if (applicableRules.length === 0) return;

    console.log(`🚀 Executing ${applicableRules.length} prefetch rules for ${location.pathname}`);

    await Promise.allSettled(
      applicableRules.map(async rule => {
        try {
          await queryClient.prefetchQuery({
            queryKey: rule.queryKey,
            queryFn: rule.queryFn,
            staleTime: 5 * 60 * 1000, // 5 minutes
          });
          
          console.log(`✅ Prefetched ${rule.queryKey.join('/')} (confidence: ${rule.confidence.toFixed(2)})`);
        } catch (error) {
          console.warn(`⚠️ Prefetch failed for ${rule.queryKey.join('/')}:`, error);
        }
      })
    );
  }, [prefetchRules, location.pathname, queryClient]);

  // Update navigation patterns
  useEffect(() => {
    if (visitHistory.length >= 2) {
      const [previous, current] = visitHistory.slice(-2);
      
      setNavigationPatterns(prev => {
        const existing = prev.find(p => 
          p.fromRoute === previous.route && p.toRoute === current.route
        );
        
        if (existing) {
          return prev.map(p => 
            p === existing 
              ? { ...p, frequency: p.frequency + 1, lastVisited: current.timestamp }
              : p
          );
        } else {
          return [...prev, {
            fromRoute: previous.route,
            toRoute: current.route,
            frequency: 1,
            lastVisited: current.timestamp,
          }];
        }
      });
    }
  }, [visitHistory]);

  // Generate rules when patterns change
  useEffect(() => {
    generatePrefetchRules();
  }, [generatePrefetchRules]);

  // Execute prefetch when rules change
  useEffect(() => {
    if (prefetchRules.length > 0) {
      // Small delay to avoid blocking the main thread
      const timer = setTimeout(executePrefetch, 1000);
      return () => clearTimeout(timer);
    }
  }, [prefetchRules, executePrefetch]);

  return {
    navigationPatterns,
    behaviorPatterns,
    prefetchRules,
    currentConfidence,
    visitHistory,
  };
};
