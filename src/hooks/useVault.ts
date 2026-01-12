import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { PasswordEntry, Category, EntryInput, UpdateEntryInput } from '../types';

export function useVault() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const vaultExists = useCallback(async (): Promise<boolean> => {
    return await invoke<boolean>('vault_exists');
  }, []);

  const isUnlocked = useCallback(async (): Promise<boolean> => {
    return await invoke<boolean>('vault_is_unlocked');
  }, []);

  const createVault = useCallback(async (masterPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await invoke('create_vault', { masterPassword });
      return true;
    } catch (e) {
      setError(e as string);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unlock = useCallback(async (masterPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await invoke('unlock_vault', { masterPassword });
      return true;
    } catch (e) {
      setError(e as string);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const lock = useCallback(async (): Promise<void> => {
    await invoke('lock_vault');
  }, []);

  const getEntries = useCallback(async (): Promise<PasswordEntry[]> => {
    try {
      return await invoke<PasswordEntry[]>('get_entries');
    } catch (e) {
      setError(e as string);
      return [];
    }
  }, []);

  const getEntry = useCallback(async (id: string): Promise<PasswordEntry | null> => {
    try {
      return await invoke<PasswordEntry>('get_entry', { id });
    } catch (e) {
      setError(e as string);
      return null;
    }
  }, []);

  const addEntry = useCallback(async (entry: EntryInput): Promise<PasswordEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await invoke<PasswordEntry>('add_entry', { entry });
    } catch (e) {
      setError(e as string);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEntry = useCallback(async (entry: UpdateEntryInput): Promise<PasswordEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await invoke<PasswordEntry>('update_entry', { entry });
    } catch (e) {
      setError(e as string);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await invoke('delete_entry', { id });
      return true;
    } catch (e) {
      setError(e as string);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchEntries = useCallback(async (query: string): Promise<PasswordEntry[]> => {
    try {
      return await invoke<PasswordEntry[]>('search_entries', { query });
    } catch (e) {
      setError(e as string);
      return [];
    }
  }, []);

  const getFavorites = useCallback(async (): Promise<PasswordEntry[]> => {
    try {
      return await invoke<PasswordEntry[]>('get_favorites');
    } catch (e) {
      setError(e as string);
      return [];
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<PasswordEntry | null> => {
    try {
      return await invoke<PasswordEntry>('toggle_favorite', { id });
    } catch (e) {
      setError(e as string);
      return null;
    }
  }, []);

  const getCategories = useCallback(async (): Promise<Category[]> => {
    try {
      return await invoke<Category[]>('get_categories');
    } catch (e) {
      setError(e as string);
      return [];
    }
  }, []);

  const generatePassword = useCallback(async (length: number, includeSymbols: boolean): Promise<string> => {
    return await invoke<string>('generate_password', { length, includeSymbols });
  }, []);

  return {
    isLoading,
    error,
    clearError,
    vaultExists,
    isUnlocked,
    createVault,
    unlock,
    lock,
    getEntries,
    getEntry,
    addEntry,
    updateEntry,
    deleteEntry,
    searchEntries,
    getFavorites,
    toggleFavorite,
    getCategories,
    generatePassword,
  };
}
