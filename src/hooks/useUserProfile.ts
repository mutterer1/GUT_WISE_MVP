import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  full_name: string;
  email: string;
}

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      setProfile({
        full_name: data?.full_name || '',
        email: data?.email || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    profile,
    profileLoading,
    refreshProfile: fetchUserProfile,
  };
}
