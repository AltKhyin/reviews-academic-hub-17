
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';

export const useUpcomingRelease = () => {
  // Function to calculate next Saturday at 9am BRT
  const getNextSaturday = () => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    const daysUntilSaturday = day === 6 ? 7 : 6 - day;
    let nextSaturday = addDays(now, daysUntilSaturday);
    nextSaturday.setHours(9, 0, 0, 0);
    
    // If it's Saturday after 9am, get next week's Saturday
    if (day === 6 && now.getHours() >= 9) {
      nextSaturday = addDays(nextSaturday, 7);
    }
    
    return nextSaturday;
  };

  return useQuery({
    queryKey: ['upcomingRelease'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('upcoming_releases')
        .select('*')
        .order('release_date', { ascending: true })
        .limit(1);

      if (error) throw error;
      
      // If no upcoming release in database, create a default one based on next Saturday
      if (!data || data.length === 0) {
        const nextSaturday = getNextSaturday();
        return {
          id: 'default',
          title: 'Próxima Edição',
          release_date: nextSaturday.toISOString(),
          created_at: new Date().toISOString()
        };
      }
      
      return data[0];
    }
  });
};
