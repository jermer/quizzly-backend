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
     * Returns { username, email }
     * 
     * Throws UnauthorizedError if incorrect username/password
     */

    static async authenticate({ username, password }) {
        // try to find the user
        const result = await db.query(
            `SELECT username,
                    password,
                    email
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
     * Returns { username, email }
     * 
     * Throws BadRequestError if username already exists in database
     */

    static async register(
        { username, password, email }) {
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
                (username, password, email)
            VALUES
                ($1, $2, $3)
            RETURNING
                username,
                email`,
            [
                username,
                hashedPassword,
                email
            ]);
        const user = result.rows[0];
        return user;
    }

    /** Get list of all users
     * 
     * Returns [ { username, email }, ... ]
     */

    static async findAll() {
        const result = await db.query(`
            SELECT username,
                   email
            FROM users
            ORDER BY username`
        );
        return result.rows;
    }

    /** Get details of specific user
     * 
     * Accepts username
     * Returns { username, email, [quizzes] }
     * 
     * Where [quizzes] = [ {id}, ... ]
     * 
     * Throws NotFoundError if invalid username
     */

    static async get(username) {
        const result = await db.query(`
            SELECT username,
                   email
            FROM users
            WHERE username = $1`,
            [username]
        );
        const user = result.rows[0];
        if (!user)
            throw new NotFoundError(`No user found with username ${username}`);

        const quizResults = await db.query(`
            SELECT id
            FROM quizzes
            WHERE creator = $1`,
            [username]);

        user.quizzes = quizResults.rows.map(q => q.id);

        return user;
    }

    /** Update details of specific user
     * 
     * Accepts username, data
     * where data may include some or all of the fields:
     *  { password, firstName, lastName, email }
     * 
     * Returns { username, firstName, lastName, email }
     * 
     * Throws NotFoundError if invalid username
     */

    static async update(username, data) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
        }

        const { setCols, values } = sqlForPartialUpdate(
            data, {});
        // username will be the last parameter in the query
        const usernameVarIdx = "$" + (values.length + 1);

        const querySQL = `
            UPDATE users
            SET ${setCols}
            WHERE username = ${usernameVarIdx}
            RETURNING username,
                      email`;
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
}

module.exports = User;