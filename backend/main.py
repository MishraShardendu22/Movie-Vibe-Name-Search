"""
FastAPI Backend for Movie Search
Supports TF-IDF and Deep Learning (MPNet) based search
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import List

# Initialize FastAPI app
app = FastAPI(
    title="Movie Search API",
    description="Search movies using TF-IDF or Deep Learning embeddings",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== GLOBAL MODEL LOADING (ONCE AT STARTUP) ==============

# Load TF-IDF components
with open("../df_rec.pkl", "rb") as f:
    df_rec = pickle.load(f)

with open("../indices.pkl", "rb") as f:
    indices = pickle.load(f)

with open("../tfidf_vectorizer.pkl", "rb") as f:
    tfidf_vectorizer = pickle.load(f)

with open("../tfidf_matrix.pkl", "rb") as f:
    tfidf_matrix = pickle.load(f)

# Load Deep Learning components
mpnet_model = SentenceTransformer("../mpnet_model")
movie_embeddings = np.load("../movie_embeddings.npy")

# Get movie titles from dataframe
movie_titles = df_rec["title"].tolist()

print("✅ All models loaded successfully!")


# ============== UTILITY FUNCTIONS ==============

def clean_query(text: str) -> str:
    """Clean and normalize the search query"""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters, keep alphanumeric and spaces
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    # Remove extra whitespace
    text = " ".join(text.split())
    return text


# ============== API ENDPOINTS ==============

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Movie Search API is running"}


@app.get("/search/tfidf")
async def search_tfidf(
    q: str = Query(..., min_length=1, description="Search query"),
    k: int = Query(10, ge=1, le=100, description="Number of results to return")
) -> dict:
    """
    Search movies using TF-IDF vectorization and cosine similarity
    Falls back to title matching if no TF-IDF results found
    """
    try:
        # Clean the query
        cleaned_query = clean_query(q)
        
        if not cleaned_query:
            raise HTTPException(status_code=400, detail="Query is empty after cleaning")
        
        # Transform query using TF-IDF vectorizer
        query_vector = tfidf_vectorizer.transform([cleaned_query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
        
        # Get top-k indices
        top_indices = similarities.argsort()[::-1][:k * 2]  # Get more initially for filtering
        
        # Get results with scores
        results = []
        for idx in top_indices:
            if similarities[idx] > 0:  # Only include if there's some similarity
                results.append({
                    "title": movie_titles[idx],
                    "score": round(float(similarities[idx]), 4)
                })
        
        # If no TF-IDF results, fall back to simple title matching
        if len(results) == 0:
            query_lower = q.lower()
            for i, title in enumerate(movie_titles):
                if query_lower in title.lower():
                    results.append({
                        "title": title,
                        "score": 0.5  # Give a default score for title matches
                    })
                    if len(results) >= k:
                        break
        
        # Limit to k results
        results = results[:k]
        
        return {
            "query": q,
            "method": "tfidf",
            "count": len(results),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search/dl")
async def search_dl(
    q: str = Query(..., min_length=1, description="Search query"),
    k: int = Query(10, ge=1, le=100, description="Number of results to return")
) -> dict:
    """
    Search movies using Deep Learning (MPNet) embeddings and cosine similarity
    """
    try:
        # Encode query using MPNet model
        query_embedding = mpnet_model.encode([q])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_embedding, movie_embeddings).flatten()
        
        # Get top-k indices
        top_indices = similarities.argsort()[::-1][:k]
        
        # Get results with scores
        results = []
        for idx in top_indices:
            results.append({
                "title": movie_titles[idx],
                "score": round(float(similarities[idx]), 4)
            })
        
        return {
            "query": q,
            "method": "deep_learning",
            "count": len(results),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/movies/count")
async def get_movie_count():
    """Get the total number of movies in the database"""
    return {"total_movies": len(movie_titles)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
