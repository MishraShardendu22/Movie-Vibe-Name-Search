# Movie Search Backend

FastAPI backend for movie search using TF-IDF and Deep Learning embeddings.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## Running the Server

```bash
# From the backend directory
uvicorn main:app --reload --port 8000

# Or run directly
python main.py
```

## API Endpoints

### Health Check

- `GET /` - Returns API status

### Search Endpoints

- `GET /search/tfidf?q=<query>&k=<num_results>` - TF-IDF based search
- `GET /search/dl?q=<query>&k=<num_results>` - Deep Learning based search

### Info

- `GET /movies/count` - Get total number of movies

## API Documentation

Once running, visit:

- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>
