/**
 * Reusable Async Data Fetching Hook
 * Consolidates loading, error, and data state management patterns
 * Replaces duplicate loading state patterns across components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export interface UseAsyncDataOptions<T> {
  /** Function that returns a promise with the data */
  fetchData: () => Promise<T>;
  /** Dependencies array to trigger refetch */
  dependencies?: React.DependencyList;
  /** Should fetch immediately on mount */
  immediate?: boolean;
  /** Initial data value */
  initialData?: T | null;
  /** Error handler */
  onError?: (error: Error) => void;
}

export interface UseAsyncDataReturn<T> {
  /** Current data value */
  data: T | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
  /** Set data manually */
  setData: (data: T | null) => void;
}

export function useAsyncData<T>({
  fetchData,
  dependencies = [],
  immediate = true,
  initialData = null,
  onError
}: UseAsyncDataOptions<T>): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      const errorObject = err instanceof Error ? err : new Error(String(err));
      setError(errorObject);
      if (onError) {
        onError(errorObject);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchData, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch data when dependencies change
  useEffect(() => {
    if (immediate) {
      refetch();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch,
    clearError,
    setData
  };
}

/**
 * Specialized hook for session-dependent data fetching
 * Waits for authentication before fetching data
 */
export function useSessionData<T>(
  fetchData: () => Promise<T>,
  options: Omit<UseAsyncDataOptions<T>, 'fetchData' | 'immediate'> = {}
) {
  const { data: session, status } = useSession();
  
  return useAsyncData({
    fetchData,
    immediate: status === 'authenticated',
    dependencies: [session, status, ...(options.dependencies || [])],
    ...options
  });
}
