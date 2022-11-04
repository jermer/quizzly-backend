"use strict";

/** Routes for users */

const express = require("express");
const router = new express.Router();

const User = require("../models/user");

/** GET /users
 * 
 *  Returns { users: [ { username, firstName, lastName, email }, ... ] }
 */

router.get('/', async function (req, res, next) {
    try {
        const users = await User.findAll();
        return res.json({ users });

    } catch (err) {
        return next(err);
    }
});

/** GET /users/:username
 * 
 * Returns { user: { username, firstName, lastName, email }}
 * 
 * AND QUIZZES...!
 */

router.get('/:username', async function (req, res, next) {
    try {
        const user = await User.get(req.params.username);
        return res.json({ user });

    } catch (err) {
        return next(err);
    }
});

/** DELETE /users/:username 
 * 
 * Returns { deleted: :username }
 */

router.delete('/:username', async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username });

    } catch (err) {
        return next(err);
    }
})

module.exports = router;
