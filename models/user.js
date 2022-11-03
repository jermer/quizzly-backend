"use strict";

/** User model */

const db = require("../db");
const bcrypt = require("bcrypt");
const {
    UnauthorizedError
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");

class User {

    /** Authenticate user given username, password 
     * 
     */
    static async authenticate(username, password) {
        // try to find the user
        const result = await db.query(
            `SELECT *
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

    static async register(
        { username, password, firstName, lastName, email }) {
        // ...
    }

}