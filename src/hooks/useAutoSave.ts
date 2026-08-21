import { useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface AutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave({ delay = 2000, onSave, onSuccess, onError }: AutoSaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const saveData = useCallback(async (data: any) => {
    if (isSavingRef.current) return;
    
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedRef.current) return;

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = dataString;
      
      toast.success('Modifications sauvegardées automatiquement', {
        duration: 2000,
      });
      
      onSuccess?.();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde automatique');
      onError?.(error as Error);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, onSuccess, onError]);

  const debouncedSave = useCallback((data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, delay);
  }, [saveData, delay]);

  const forceSave = useCallback((data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData(data);
  }, [saveData]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedSave,
    forceSave,
    isSaving: isSavingRef.current
  };
}