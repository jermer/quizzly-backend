"use strict";

/** Routes for authentication */

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const userLoginSchema = require("../schemas/userLogin.json");
const userRegisterSchema = require("../schemas/userNew.json");

const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const { BadRequestError } = require("../expressError");

/** POST /auth/token
 *
 * Accepts { username, password }
 * 
 * Returns { token }, which can be used to authenticate
 * future requests.
 */

router.post("/token", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userLoginSchema);
        if (!validator.valid) {
            // invalid login data format
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // authenticate user, will throw error if invalid
        const user = await User.authenticate(req.body);

        // if we've made it this far, all is well
        const token = createToken(user);
        return res.json({ token });

    } catch (err) {
        return next(err);
    }
});

/** POST /auth/validate
 * 
 * Accepts { username, password }
 * 
 * Returns { success: true/false }, depending on whether the
 * given username and password match.
 */

router.post("/validate", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userLoginSchema);
        if (!validator.valid) {
            // invalid login data format
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // authenticate user, will throw error if invalid
        const user = await User.authenticate(req.body);

        // if we've made it this far, all is well
        return res.json({ success: true });

    } catch (err) {
        return next(res.json({ success: false }));
    }
});

/** POST /auth/register 
 * 
 * Accepts { username, password, email, isAdmin }
 * 
 * Returns { token }, which can be used to authenticate
 * future requests.
 */

router.post("/register", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            // invalid registration data format
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // add new user, will throw error if duplicate username
        const user = await User.register(req.body);

        // if we've made it this far, all is well
        const token = createToken(user);
        return res.status(201).json({ token });

    } catch (err) {
        return next(err);
    }
});

module.exports = router;