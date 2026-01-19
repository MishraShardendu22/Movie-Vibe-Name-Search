const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface MovieResult {
  title: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  method: string;
  count: number;
  results: MovieResult[];
}

export type SearchMethod = "tfidf" | "dl";

export async function searchMovies(
  query: string,
  method: SearchMethod,
  k: number = 10
): Promise<SearchResponse> {
  const endpoint = method === "tfidf" ? "/search/tfidf" : "/search/dl";
  const url = `${API_BASE_URL}${endpoint}?q=${encodeURIComponent(query)}&k=${k}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Search failed with status ${response.status}`);
  }

  return response.json();
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}
