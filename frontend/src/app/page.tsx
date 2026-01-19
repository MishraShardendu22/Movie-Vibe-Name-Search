"use client";

import { useState, FormEvent } from "react";
import { useMovieSearch } from "@/hooks/useMovieSearch";
import type { SearchMethod } from "@/lib/api";

export default function Home() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<SearchMethod>("dl");
  const [resultCount, setResultCount] = useState(10);
  const { results, isLoading, error, search, clearResults } = useMovieSearch();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await search(query, method, resultCount);
  };

  const handleClear = () => {
    setQuery("");
    clearResults();
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎬 Movie Search
          </h1>
          <p className="text-gray-400 text-lg">
            Find movies using AI-powered search
          </p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies... (e.g., 'space adventure', 'romantic comedy')"
                className="w-full px-5 py-4 bg-black border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all text-lg"
              />
            </div>

            {/* Options Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              {/* Method Dropdown */}
              <div className="flex-1">
                <label className="block text-gray-400 text-sm mb-2">
                  Search Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as SearchMethod)}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white transition-all cursor-pointer"
                >
                  <option value="dl">🧠 DL - Semantic Vibe Search</option>
                  <option value="tfidf">📊 ML - Keyword Matching</option>
                </select>
              </div>

              {/* Result Count */}
              <div className="w-full sm:w-40">
                <label className="block text-gray-400 text-sm mb-2">
                  Results
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={resultCount}
                  onChange={(e) => setResultCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                  className="w-full px-4 py-3 bg-black border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white transition-all"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="flex-1 px-6 py-3 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
              {(query || results) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-xl text-white">
            <p className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Results for &quot;{results.query}&quot;
              </h2>
              <span className="text-sm text-gray-500">
                {results.count} movies • {results.method === "deep_learning" ? "🧠 DL" : "📊 TF-IDF"}
              </span>
            </div>

            {results.results.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No movies found matching your query.</p>
            ) : (
              <ul className="space-y-2">
                {results.results.map((movie, index) => (
                  <li
                    key={`${movie.title}-${index}`}
                    className="flex items-center justify-between p-4 bg-black rounded-lg hover:bg-gray-950 transition-colors border border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 font-mono text-sm w-6">
                        {index + 1}.
                      </span>
                      <span className="text-white font-medium">{movie.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${Math.min(movie.score * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-500 text-sm font-mono w-14 text-right">
                        {(movie.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Method Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              🧠 DL - Deep Learning Search
            </h3>
            <p className="text-gray-500 text-sm">
              Searches based on <span className="text-white font-medium">semantic meaning and vibe</span> of the film. Understands what the movie is about, its themes, mood, and the story being shown. Perfect for &quot;movies like this&quot; or conceptual searches.
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              📊 ML - Machine Learning Search
            </h3>
            <p className="text-gray-500 text-sm">
              Searches based on <span className="text-white font-medium">keyword matching</span> and how closely movie details match your search terms. Looks for specific words in titles, descriptions, and metadata. Best for exact term searches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
