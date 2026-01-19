import pickle
import pandas as pd

# Load the dataframe
df = pickle.load(open('df_rec.pkl', 'rb'))

print(f'Total movies: {len(df)}')
print(f'Columns: {df.columns.tolist()}')
print('\nFirst 5 movies:')
print(df[['title']].head())

# Check for avatar
avatar_movies = df[df['title'].str.contains('avatar', case=False, na=False)]
print(f'\nAvatar movies found: {len(avatar_movies)}')
if len(avatar_movies) > 0:
    print(avatar_movies[['title']].head(10))
