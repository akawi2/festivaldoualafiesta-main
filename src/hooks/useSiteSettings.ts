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

  // Écrit via une RPC qui exige les identifiants d'un admin, puis relit la valeur
  // réellement enregistrée : on ne se fie plus à l'état local (qui pouvait afficher
  // un succès alors que rien n'était sauvegardé).
  const updateSetting = async (
    key: 'voting_enabled' | 'registration_enabled',
    value: boolean,
    actingEmail: string,
    actingPassword: string,
  ): Promise<{ ok: boolean; message?: string }> => {
    try {
      const { error } = await supabase.rpc('admin_update_site_setting', {
        p_acting_email: actingEmail,
        p_acting_password: actingPassword,
        p_key: key,
        p_value: value,
      });

      if (error) throw error;

      const { data, error: readError } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle();
      if (readError) throw readError;

      const saved = typeof data?.value === 'string' ? data.value === 'true' : data?.value === true;
      if (saved !== value) {
        return { ok: false, message: "La modification n'a pas été enregistrée." };
      }

      if (key === 'voting_enabled') {
        setVotingEnabled(saved);
      } else {
        setRegistrationEnabled(saved);
      }

      return { ok: true };
    } catch (error) {
      console.error('Error updating site setting:', error);
      const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : undefined;
      return { ok: false, message };
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
