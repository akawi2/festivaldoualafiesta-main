import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSetting {
  key: string;
  value: any;
}

export function useSiteSettings() {
  const [votingEnabled, setVotingEnabled] = useState(true);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['voting_enabled', 'registration_enabled']);

      if (error) throw error;

      data?.forEach((setting: SiteSetting) => {
        const value = typeof setting.value === 'string' 
          ? setting.value === 'true' 
          : setting.value === true;
        
        if (setting.key === 'voting_enabled') {
          setVotingEnabled(value);
        } else if (setting.key === 'registration_enabled') {
          setRegistrationEnabled(value);
        }
      });
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      if (key === 'voting_enabled') {
        setVotingEnabled(value);
      } else if (key === 'registration_enabled') {
        setRegistrationEnabled(value);
      }

      return true;
    } catch (error) {
      console.error('Error updating site setting:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'site_settings' }, 
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    votingEnabled,
    registrationEnabled,
    loading,
    updateSetting,
  };
}
