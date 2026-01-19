"use client";

import { useState, useCallback } from "react";
import { searchMovies, type SearchResponse, type SearchMethod } from "@/lib/api";

interface UseMovieSearchResult {
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
  search: (query: string, method: SearchMethod, k?: number) => Promise<void>;
  clearResults: () => void;
}

export function useMovieSearch(): UseMovieSearchResult {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, method: SearchMethod, k: number = 10) => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await searchMovies(query, method, k);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, isLoading, error, search, clearResults };
}
