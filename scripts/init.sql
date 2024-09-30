CREATE TABLE movie (
    id SERIAL PRIMARY KEY,
    title TEXT,
    genre TEXT
);

INSERT INTO movie (title, genre)
    VALUES
    ('Inception', 'Sci-Fi'), 
    ('The Godfather', 'Crime'),
    ('The Dark Knight', 'Action'),
    ('Pulp Fiction', 'Crime'),
    ('Forrest Gump', 'Drama');