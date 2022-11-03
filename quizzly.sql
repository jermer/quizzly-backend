\echo 'Delete and recreate quizzly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE quizzly;
CREATE DATABASE quizzly;
\connect quizzly

\i quizzly-schema.sql
\i quizzly-seed.sql

\echo 'Delete and recreate quizzly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE quizzly_test;
CREATE DATABASE quizzly_test;
\connect quizzly_test

\i quizzly-schema.sql
