"use strict";

/** Routes for users */

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");

const User = require("../models/user");
const { BadRequestError } = require("../expressError");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");

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

/** PATCH /users/:username
 * 
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email }
 **/

router.patch("/:username", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.update(req.params.username, req.body);
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

/** POST /users/:username/quizzes/:quizId 
 * 
 * Returns { recorded: { username, quizId, score } }
 */

router.post('/:username/quizzes/:quizId', async function (req, res, next) {
    try {
        const username = req.params.username;
        const quizId = +req.params.quizId;
        const score = +req.body.score;

        // validate score is an integer
        if (!Number.isInteger(score))
            throw new BadRequestError("Score must be an integer.");

        await User.recordQuizScore(username, quizId, score);
        return res.json({ recorded: { username, quizId, score } });

    } catch (err) {
        return next(err);
    }
})

module.exports = router;
