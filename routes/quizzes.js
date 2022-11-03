"use strict";

/** Routes for quizzes */

const express = require("express");
const db = require("../db");
const router = new express.Router();

const Quiz = require("../models/quiz");

/** GET /quizzes
 * 
 *  Returns { quizzes: [ { id, title, description }, ... ] }
 */

router.get('/', async function (req, res, next) {
    try {
        const quizzes = await Quiz.findAll();
        return res.json({ quizzes });

    } catch (err) {
        return next(err);
    }
});


/** GET /quizzes/:id
 * 
 * Returns { quiz: { id, title, description, questions }}
 * where questions is [ {id, id, q_text, right_a,
 *                      wrong_a1, wrong_a2, wrong_a3,
 *                      quiz_id}, ... ]
 */

router.get('/:id', async function (req, res, next) {
    try {
        const quiz = await Quiz.get(req.params.id);
        return res.json({ quiz });

    } catch (err) {
        return next(err);
    }
});


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
