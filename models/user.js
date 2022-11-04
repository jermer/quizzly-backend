"use strict";

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
     * Returns { username, firstName, lastName, email }
     * 
     * Throws UnauthorizedError if incorrect username/password
     */

    static async authenticate(username, password) {
        // try to find the user
        const result = await db.query(
            `SELECT username,
                    password,
                    first_name as "firstName",
                    last_name as "lastName",
                    email
             FROM users
             WHERE username = $1`,
            [username]
        );
        const user = result.rows[0];

        if (user) {
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
     * Accepts { username, password, firstName, lastName, email } 
     * Returns { username, firstName, lastName, email }
     * 
     * Throws BadRequestError if username already exists in database
     */

    static async register(
        { username, password, firstName, lastName, email }) {
        // check to see whether this username is already taken
        const dupCheck = await db.query(`
            SELECT username
            FROM users
            WHERE username = $1`,
            [username]);
        if (dupCheck.rows[0])
            throw new BadRequestError(`Username ${username} is already taken`);

        // username is valid, so hash password
        const hashedPassword = bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        // add user to database
        const result = await db.query(`
            INSERT INTO users
                (username, password, first_name, last_name, email)
            VALUES
                ($1, $2, $3, $4, $5)
            RETURNING
                username,
                first_name as "firstName",
                last_name as "lastName",
                email`,
            [
                username,
                hashedPassword,
                firstName,
                lastName,
                email
            ]);
        const user = result.rows[0];
        return user;
    }

    /** Get list of all users
     * 
     * Returns [ { username, firstName, lastName, email }, ... ]
     */

    static async findAll() {
        const result = await db.query(`
            SELECT username,
                   first_name AS "firstName",
                   last_name AS "lastName",
                   email
            FROM users
            ORDER BY username`
        );
        return result.rows;
    }

    /** Get details of specific user
     * 
     * Accepts username
     * Returns { username, firstName, lastName, email }
     * 
     * Throws NotFoundError if invalid username
     */

    static async get(username) {
        const result = await db.query(`
            SELECT username,
                   first_name AS "firstName",
                   last_name AS "lastName",
                   email
            FROM users
            WHERE username = $1`,
            [username]
        );
        const user = result.rows[0];
        if (!user)
            throw new NotFoundError(`No user found with username ${username}`);

        return user;
    }

    /** Update details of specific user
     * 
     * Accepts username
     * Returns { username, firstName, lastName, email }
     * 
     * Throws NotFoundError if invalid username
     */

    static async update(username, data) {

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