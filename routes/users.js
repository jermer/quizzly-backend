"use strict";

/** Routes for users */

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");

const User = require("../models/user");
const { BadRequestError } = require("../expressError");
const {
    ensureAdmin,
    ensureCorrectUserOrAdmin
} = require("../middleware/auth");

/** GET /users
 * 
 *  Returns { users: [ { username, email, isAdmin }, ... ] }
 * 
 *  Authorization required: admin
 */

router.get('/', ensureAdmin, async function (req, res, next) {
    try {
        const users = await User.findAll();
        return res.json({ users });

    } catch (err) {
        return next(err);
    }
});

/** GET /users/:username
 * 
 * Returns { user: { username, email, isAdmin, quizzes, scores }}
 *  where quizzes is [ quiz_id, ... ]
 *  where scores is [ { quiz_id, score }, ... ]
 * 
 * Authorization required: admin or the requested user
 */

router.get('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
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
 *   { password, email, isAdmin }
 *
 * Returns { username, email, isAdmin }
 * 
 * Authorization required: admin or the requested user
 **/

router.patch("/:username", ensureCorrectUserOrAdmin, async function (req, res, next) {
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
 * Returns { deleted: username }
 * 
 * Authorization required: admin or the requested user
 */

router.delete('/:username', ensureCorrectUserOrAdmin, async function (req, res, next) {
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
 * 
 * Authorization required: admin or the requested user
 */

router.post('/:username/quizzes/:quizId', ensureCorrectUserOrAdmin, async function (req, res, next) {
    try {
        const username = req.params.username;
        const quizId = +req.params.quizId;
        const score = +req.body.score;

        // validate score is an integer
        if (!Number.isInteger(score))
            throw new BadRequestError("Score must be an integer.");

        const scoreReport = await User.recordQuizScore(username, quizId, score);
        return res.json({ score: scoreReport });

    } catch (err) {
        return next(err);
    }
})

module.exports = router;
