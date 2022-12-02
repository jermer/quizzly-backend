"use strict";

// import { sqlForPartialUpdate } from "../helpers/sql";
const { sqlForPartialUpdate } = require("../helpers/sql");

/** User model */

const db = require("../db");
const bcrypt = require("bcrypt");
const {
    UnauthorizedError, BadRequestError, NotFoundError
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");
const e = require("express");

class User {

    /** Authenticate user
     * 
     * Accepts { username, password } 
     * Returns { username, email, isAdmin }
     * 
     * Throws UnauthorizedError if incorrect username/password
     */

    static async authenticate({ username, password }) {
        // try to find the user
        const result = await db.query(
            `SELECT username,
                    password,
                    email,
                    is_admin AS "isAdmin"
             FROM users
             WHERE username = $1`,
            [username]
        );
        const user = result.rows[0];

        if (user) {
            // user found compare passwords
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                // authentication successful
                delete user.password;
                return user;
            }
        }

        // authentication failed
        throw new UnauthorizedError("Invalid username/password");
    }

    /** Register new user
     * 
     * Accepts { username, password, email } 
     * Returns { username, email, isAdmin }
     * 
     * Throws BadRequestError if username already exists in database
     */

    static async register({ username, password, email, isAdmin }) {
        // check to see whether this username is already taken
        const dupCheck = await db.query(`
            SELECT username
            FROM users
            WHERE username = $1`,
            [username]);
        if (dupCheck.rows[0])
            throw new BadRequestError(`Username ${username} is already taken`);

        // username is valid, so hash password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        // add user to database
        const result = await db.query(`
            INSERT INTO users
                (username, password, email, is_admin)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                username,
                email,
                is_admin AS "isAdmin"`,
            [
                username,
                hashedPassword,
                email,
                isAdmin
            ]);
        const user = result.rows[0];
        return user;
    }

    /** Get list of all users
     * 
     * Returns [ { username, email, isAdmin }, ... ]
     */

    static async findAll() {
        const result = await db.query(`
            SELECT username,
                   email,
                   is_admin AS "isAdmin"
            FROM users
            ORDER BY username`
        );
        return result.rows;
    }

    /** Get details of specific user
     * 
     * Accepts username
     * Returns { username, email, isAdmin, quizzes, scores }
     * 
     * Where quizzes = [ {id}, ... ]
     * and   scores = [ {id, score}, ... ]
     * 
     * Throws NotFoundError if invalid username
     */

    static async get(username) {
        const result = await db.query(`
            SELECT username,
                   email,
                   is_admin AS "isAdmin"
            FROM users
            WHERE username = $1`,
            [username]
        );
        const user = result.rows[0];
        if (!user)
            throw new NotFoundError(`No user found with username ${username}`);

        // get list of quiz ids created by this user
        const quizResults = await db.query(`
            SELECT id
            FROM quizzes
            WHERE creator = $1`,
            [username]);
        user.quizzes = quizResults.rows.map(q => q.id);


        `
SELECT users_quizzes.quiz_id, title, time_taken, count(questions.id) AS"num_questions" FROM users_quizzes                                             JOIN quizzes ON quizzes.id=users_quizzes.quiz_id                                JOIN questions ON questions.quiz_id=users_quizzes.quiz_id WHERE username='testuser'                                                                             GROUP BY users_quizzes.quiz_id, title, time_taken
`

        // get list of quiz scores for quizzes this user has played
        const scoreResults = await db.query(`
            SELECT
                users_quizzes.quiz_id AS "quizId",
                title,
                last_score AS "lastScore",
                best_score AS "bestScore",
                time_taken AS "timeTaken",
                COUNT(questions.id) AS "numQuestions"
            FROM users_quizzes
            JOIN quizzes
                ON quizzes.id = users_quizzes.quiz_id
            JOIN questions
                ON questions.quiz_id = users_quizzes.quiz_id
            WHERE username = $1
            GROUP BY
                users_quizzes.quiz_id,
                title,
                last_score,
                best_score,
                time_taken`,
            [username]);
        user.scores = scoreResults.rows.map(s => (
            {
                quizId: s.quizId,
                title: s.title,
                lastScore: s.lastScore,
                bestScore: s.bestScore,
                timeTaken: s.timeTaken,
                numQuestions: s.numQuestions
            }));

        return user;
    }

    /** Update details of specific user
     * 
     * Accepts username, data
     * where data may include some or all of the fields:
     *  { password, email, isAdmin }
     * 
     * Returns { username, email, isAdmin }
     * 
     * Throws NotFoundError if invalid username
     */

    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                isAdmin: "is_admin"
            });
        // username will be the last parameter in the query
        const usernameVarIdx = "$" + (values.length + 1);

        const querySQL = `
            UPDATE users
            SET ${setCols}
            WHERE username = ${usernameVarIdx}
            RETURNING username,
                      email,
                      is_admin AS "isAdmin"`;
        const result = await db.query(querySQL, [...values, username]);
        const user = result.rows[0];

        if (!user)
            throw new NotFoundError(`No user found with username ${username}`);

        delete user.password;
        return user;
    }

    /** Delete specific user
     * 
     * Accepts username
     * Returns undefined
     * 
     * Throws NotFoundError if invalid username
     */

    static async remove(username) {
        const result = await db.query(`
            DELETE FROM users
            WHERE username = $1
            RETURNING username`,
            [username]
        );
        const user = result.rows[0];
        if (!user)
            throw new NotFoundError(`No user found with username ${username}`);
    }

    /** Record user score on a particular quiz
     * 
     * Accepts username, quizId, score
     * Returns undefined
     * 
     * Throws NotFoundError is invalid username or quizId 
     */

    static async recordQuizScore(username, quizId, score) {
        // check for valid username
        const userCheck = await db.query(`
            SELECT username
            FROM users
            WHERE username = $1`,
            [username]);
        const user = userCheck.rows[0];

        if (!user) throw new NotFoundError(`No user found with username ${username}`);

        // check for valid quiz_id
        const quizCheck = await db.query(`
            SELECT id
            FROM quizzes
            WHERE id = $1`,
            [quizId]);
        const quiz = quizCheck.rows[0];

        if (!quiz) throw new NotFoundError(`No quiz found with id ${quizId}`);

        // create a SQL-friendly timestamp from the current time
        // source: https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // create new entry in the join table
        await db.query(`
            INSERT INTO users_quizzes (
                username,
                quiz_id,
                last_score,
                best_score,
                time_taken
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [username, quizId, score, score, timestamp]);
    }
}

module.exports = User;