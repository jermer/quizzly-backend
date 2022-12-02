CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(25) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    creator VARCHAR(25) NOT NULL
      REFERENCES users ON DELETE CASCADE
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    q_text TEXT NOT NULL,
    right_a TEXT NOT NULL,
    wrong_a1 TEXT NOT NULL,
    wrong_a2 TEXT NOT NULL,
    wrong_a3 TEXT NOT NULL,
    quiz_id INTEGER NOT NULL
      REFERENCES quizzes ON DELETE CASCADE,
    -- Optional columns to allow for future features
    q_order INTEGER,    
    q_type VARCHAR(25),
    is_timed BOOLEAN DEFAULT FALSE
);

CREATE TABLE users_quizzes (
  username VARCHAR(25) NOT NULL
    REFERENCES users ON DELETE CASCADE,
  quiz_id INTEGER NOT NULL
    REFERENCES quizzes ON DELETE CASCADE,
  last_score INTEGER NOT NULL,
  best_score INTEGER NOT NULL,
  time_taken TIMESTAMP (0) NOT NULL,
  PRIMARY KEY (username, quiz_id)
);
