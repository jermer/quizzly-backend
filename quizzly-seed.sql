
-- two sample users
-- both have password set to 'password'
INSERT INTO users (username, password, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'test@test.com', FALSE),
        ('testuser2',
        '$2b$12$Ayyeojp42gqqpZ12NX8WI.86.a2U0pPkm7/aVXTsAN5fPcBCSjv0.',
        'test2@test.com', FALSE),
        ('testadmin',
        '$2b$12$nXZXjcVcmh7b.YXNgeFk3OXfCie3F1QUKNDkUSKXa83TEjhcNg20a',
        'admin@test.com', TRUE);

-- three sample quizzes
INSERT INTO quizzes (id, title, description, creator, is_public)
VALUES (111, 'Shapes Quiz', 'A fun sample quiz about shapes!', 'testuser', TRUE),
       (222, 'States Quiz', 'A fun quiz about US states!', 'testuser2', FALSE),
       (333, 'Arithmetic Quiz', 'A sample quiz about arithmetic!', 'testuser', FALSE);

-- sample questions
--   quiz 111: 5 questions
--   quiz 222: 3 questions
--   quiz 333: 3 questions
INSERT INTO questions ( q_text,
                        right_a,
                        wrong_a1,
                        wrong_a2,
                        wrong_a3,
                        quiz_id)
VALUES ('How many sides does a triangle have?',
            '3 sides',
            '4 sides',
            '5 sides',
            '6 sides',
            111),
        ('The angles of a square each measure...',
            '90 degrees',
            '60 degrees',
            '45 degrees',
            '30 degrees',
            111),
        ('A hexagon has how many sides?',
            '6 sides',
            '4 sides',
            '5 sides',
            '8 sides',
            111),
        ('Lines that never intersect are called...',
            'parallel',
            'perpendicular',
            'skew',
            'obtuse',
            111),
        ('Two angles that sum to 180 degrees are called...',
            'supplementary',
            'complementary',
            'acute',
            'obtuse',
            111),
        ('Which US state has the longest coastline?',
            'Alaska',
            'California',
            'Hawaii',
            'Florida',
            222),
        ('What is the only letter that does not appear in a state name?',
            'Q',
            'X',
            'J',
            'Z',
            222),
        ('How many islands make up the state of Hawaii?',
            '137',
            '42',
            '8',
            '5',
            222),
        ('8 + 12',
            '20',
            '96',
            '-6',
            '4',
            333),
        ('4 * 15',
            '60',
            '11',
            '-9',
            '19',
            333),
        ('96 - 31',
            '65',
            '107',
            '-15',
            '42',
            333);

-- sample quiz scores for testuser
INSERT INTO users_quizzes (username, quiz_id, last_score, best_score, time_taken)
    VALUES ('testuser', 111, 5, 5, '1999-01-08 04:05:06'),
           ('testuser', 222, 1, 2, '2004-10-19 10:23:54'),
           ('testuser', 333, 3, 3, '2022-06-23 15:46:37');
