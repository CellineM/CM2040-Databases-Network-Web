
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

-- Create a table for recipes without the publish_date column
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    recipe_info TEXT,
    publish_date TEXT,
    published DATETIME,
    modified DATETIME,
    author_name TEXT,
    created_date DATETIME,
    blog_id INTEGER,
    FOREIGN KEY (blog_id) REFERENCES blog_settings(id),
    num_reads INTEGER DEFAULT 0, 
    num_likes INTEGER DEFAULT 0

);

CREATE TABLE IF NOT EXISTS blog_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_title TEXT,
    author_name TEXT
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER,
    readerName TEXT,
    readerText TEXT,
    date TEXT,
    FOREIGN KEY (article_id) REFERENCES recipes(id)
);

 

COMMIT;

