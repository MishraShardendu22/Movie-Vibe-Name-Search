import pickle
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import re

# Load the data
print("Loading data...")
with open("../df_rec.pkl", "rb") as f:
    df_rec = pickle.load(f)

with open("../tfidf_vectorizer.pkl", "rb") as f:
    tfidf_vectorizer = pickle.load(f)

with open("../tfidf_matrix.pkl", "rb") as f:
    tfidf_matrix = pickle.load(f)

print(f"Total movies: {len(df_rec)}")
print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
print(f"Columns in df_rec: {df_rec.columns.tolist()}")

# Check for avatar in titles
print("\n=== Checking for 'Avatar' in titles ===")
avatar_mask = df_rec['title'].str.contains('Avatar', case=False, na=False)
print(f"Movies with 'Avatar' in title: {avatar_mask.sum()}")
if avatar_mask.sum() > 0:
    print(df_rec[avatar_mask][['title']].head(10))

# Test the search
def clean_query(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = " ".join(text.split())
    return text

query = "avatar"
cleaned_query = clean_query(query)
print(f"\n=== Testing search for '{query}' (cleaned: '{cleaned_query}') ===")

# Transform query
query_vector = tfidf_vectorizer.transform([cleaned_query])
print(f"Query vector shape: {query_vector.shape}")
print(f"Query vector nnz: {query_vector.nnz}")

# Calculate similarities
similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
print(f"Similarities shape: {similarities.shape}")
print(f"Max similarity: {similarities.max()}")
print(f"Similarities > 0: {(similarities > 0).sum()}")
print(f"Similarities > 0.1: {(similarities > 0.1).sum()}")

# Get top results
top_indices = similarities.argsort()[::-1][:10]
print("\n=== Top 10 results ===")
for idx in top_indices:
    title = df_rec.iloc[idx]['title']
    score = similarities[idx]
    print(f"{score:.4f} - {title}")
