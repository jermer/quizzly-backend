"use strict";

/** Routes for quizzes */

const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();

const Quiz = require("../models/quiz");
const newQuizSchema = require("../schemas/quizNew.json");
const updateQuizSchema = require("../schemas/quizUpdate.json");

const { BadRequestError } = require("../expressError");

/** POST /quizzes
 * 
 * Accepts {title, description}
 * 
 * Returns { quiz: { id, title, description } }
 */

router.post('/', async function (req, res, next) {
    try {
        // validate request body
        const validator = jsonschema.validate(req.body, newQuizSchema);
        if (!validator.valid) {
            // request body is invalid
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // request body is valid, proceed
        const quiz = await Quiz.create(req.body);

        // return with status code 201
        return res.status(201).json({ quiz });

    } catch (err) {
        return next(err);
    }
});

/** GET /quizzes
 * 
 *  Returns { quizzes: [ { id, title, description, creator }, ... ] }
 */

router.get('/', async function (req, res, next) {
    const q = req.query;

    try {
        const quizzes = await Quiz.findAll(q);
        return res.json({ quizzes });

    } catch (err) {
        return next(err);
    }
});

/** GET /quizzes/:id
 * 
 * Returns { quiz: { id, title, description, creator, questions }}
 * where questions is [ {id, id, qText, rightA,
 *                      wrongA1, wrongA2, wrongA3,
 *                      quizId}, ... ]
 */

router.get('/:id', async function (req, res, next) {
    try {
        const quiz = await Quiz.get(req.params.id);
        return res.json({ quiz });

    } catch (err) {
        return next(err);
    }
});

/** PATCH /quizzes/:id
 * 
 * Accepts update data which may include the fields:
 *  { title, description }
 * 
 * Returns { quiz: { id, title, description, creator } }
 */
router.patch('/:id', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, updateQuizSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const quiz = await Quiz.update(req.params.id, req.body);
        return res.json({ quiz });

    } catch (err) {
        return next(err);
    }
})

/** DELETE /quizzes/:id 
 * 
 * Returns { deleted: :id }
 */

router.delete('/:id', async function (req, res, next) {
    try {
        await Quiz.remove(req.params.id);
        return res.json({ deleted: req.params.id });

    } catch (err) {
        return next(err);
    }
})

module.exports = router;
