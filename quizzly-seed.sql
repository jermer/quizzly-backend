
-- testuser password is 'password'
INSERT INTO users (username, password, first_name, last_name, email)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'Test',
        'User',
        'test@testing.com');

INSERT INTO quizzes (id, title, description)
VALUES (1, 'Shapes Quiz', 'A quiz about shapes!');

INSERT INTO questions ( q_text,
                        right_a,
                        wrong_a1,
                        wrong_a2,
                        wrong_a3,
                        question_order,
                        quiz_id)
VALUES ('How many sides does a triangle have?',
            '3 sides',
            '4 sides',
            '5 sides',
            '6 sides',
            1, 1),
        ('The angles of a square each measure...',
            '90 degrees',
            '60 degrees',
            '45 degrees',
            '30 degrees',
            2, 1),
        ('A hexagon has how many sides?',
            '6 sides',
            '4 sides',
            '5 sides',
            '8 sides',
            3, 1),
        ('Lines that never intersect are called...',
            'parallel',
            'perpendicular',
            'skew',
            'obtuse',
            4, 1),
        ('Two angles that sum to 180 degrees are called...',
            'supplementary',
            'complementary',
            'acute',
            'obtuse',
            5, 1);