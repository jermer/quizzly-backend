
/** Routes for authentication */

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const userAuthSchema = require("../schemas/userLogin.json");
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
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            // invalid login data format
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // authenticate user, which will throw error if invalid
        const user = await User.authenticate(req.body);

        // if we've made it this far, all is well
        const token = createToken(user);
        return res.json({ token });

    } catch (err) {
        return next(err);
    }
});

/** POST /auth/register 
 * 
 * Accepts {}
 * 
 * Returns { token }, which can be used to authenticate
 * future requests.
 */

router.post("/register", async function (req, res, next) {
    try {
        return null;

    } catch (err) {
        return next(err);
    }
});


module.exports = router;