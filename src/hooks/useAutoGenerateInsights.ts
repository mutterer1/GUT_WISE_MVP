import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { generateAllInsights, saveInsights } from '../utils/insightEngine';

export function useAutoGenerateInsights() {
  const { user } = useAuth();
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (!user || hasGeneratedRef.current) return;

    const generateInsightsInBackground = async () => {
      try {
        const lastGeneratedKey = `insights_last_generated_${user.id}`;
        const lastGenerated = localStorage.getItem(lastGeneratedKey);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (lastGenerated && now - parseInt(lastGenerated) < twentyFourHours) {
          return;
        }

        const insights = await generateAllInsights(user.id);

        if (insights.length > 0) {
          await saveInsights(insights);
          localStorage.setItem(lastGeneratedKey, now.toString());
        }

        hasGeneratedRef.current = true;
      } catch (error) {
        console.error('Background insight generation failed:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      generateInsightsInBackground();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [user]);
}
