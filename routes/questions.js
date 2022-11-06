"use strict";

/** Routes for questions */

const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();

const Question = require("../models/question");
const newQuestionSchema = require("../schemas/questionNew.json");

const { BadRequestError } = require("../expressError");

/** POST /questions
 *
 * Accepts { q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id }
 *
 * Returns { question: { id, q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id } }
 */

router.post('/', async function (req, res, next) {
    try {
        // validate request body
        const validator = jsonschema.validate(req.body, newQuestionSchema);
        if (!validator.valid) {
            // request body is invalid
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        // request body is valid, proceed
        const question = await Question.create(req.body);

        // return with status code 201
        return res.status(201).json({ question });

    } catch (err) {
        return next(err);
    }
});

/** GET /questions
 * 
 *  Returns { questions: [ { id, q_text, right_a,
 *                          wrong_a1, wrong_a2, wrong_a3, quiz_id }, ... ] }
 */

router.get('/', async function (req, res, next) {
    const q = req.query;

    // recast quiz_id as an integer, if included in query string
    if (q.quiz_id) q.quiz_id = +q.quiz_id;

    try {
        const questions = await Question.findAll(q);
        return res.json({ questions });

    } catch (err) {
        return next(err);
    }
});

/** GET /questions/:id
 * 
 * Returns { question: { id, q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id } }
 */

router.get('/:id', async function (req, res, next) {
    try {
        const question = await Question.get(req.params.id);
        return res.json({ question });

    } catch (err) {
        return next(err);
    }
});

/** DELETE /question/:id 
 * 
 * Returns { deleted: :id }
 */

router.delete('/:id', async function (req, res, next) {
    try {
        await Question.remove(req.params.id);
        return res.json({ deleted: req.params.id });

    } catch (err) {
        return next(err);
    }
})

module.exports = router;
