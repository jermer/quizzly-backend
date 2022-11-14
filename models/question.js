"use strict";

const db = require("../db");
const {
    NotFoundError,
    BadRequestError
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Question {

    /** Create a new question.
     * 
     * Accepts { qText, rightA, wrongA1, wrongA2, wrongA3,
     *  questionOrder, quizId }
     * 
     * Returns { id, qText, rightA, wrongA1, wrongA2, wrongA3,
     *  questionOrder, quizId }
     */

    static async create(
        { qText, rightA, wrongA1, wrongA2, wrongA3,
            questionOrder, quizId }) {
        // verify that quizId is valid
        const quizCheck = await db.query(`
            SELECT id
            FROM quizzes
            WHERE id = $1`,
            [quizId]);

        if (!quizCheck.rows[0])
            throw new BadRequestError(`Invalid quiz id: ${quizId}`);

        const result = await db.query(`
            INSERT INTO questions
                (q_text, right_a, wrong_a1, wrong_a2, wrong_a3, question_order, quiz_id)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                id,
                q_text AS "qText",
                right_a AS "rightA",
                wrong_a1 AS "wrongA1",
                wrong_a2 AS "wrongA2",
                wrong_a3 AS "wrongA3",
                question_order AS "questionOrder",
                quiz_id AS "quizId"`,
            [qText, rightA, wrongA1, wrongA2, wrongA3,
                questionOrder, quizId]);
        const question = result.rows[0];
        return question;
    }

    /** Find all questions that meet filter criteria
     * 
     * no filters are applied by default
     * optional filters may include:
     * - quizId
     * 
     * Returns [ { id, qText, rightA, wrongA1, wrongA2, wrongA3,
     *  questionOrder, quizId }. ... ]
     */

    static async findAll(filters = {}) {
        let query = `
            SELECT id,
                   q_text AS "qText",
                   right_a AS "rightA",
                   wrong_a1 AS "wrongA1",
                   wrong_a2 AS "wrongA2",
                   wrong_a3 AS "wrongA3",
                   question_order AS "questionOrder",
                   quiz_id AS "quizId"
            FROM questions`;

        // prepare for optional filters
        let whereExpressions = [];
        let queryValues = [];

        // descructure optional filters
        const { quizId } = filters;

        if (quizId) {
            queryValues.push(quizId);
            whereExpressions.push(`quiz_id = $${queryValues.length}`);
        }

        // add any filtering expressions to the query
        if (whereExpressions.length > 0) {
            query += ' WHERE ' + whereExpressions.join(' AND ');
        }

        // execute query and return results
        query += ' ORDER BY quiz_id, question_order';
        const results = await db.query(query, queryValues);
        return results.rows;
    }

    /** Get specific question by id
     * 
     *  Returns { id, qText, rightA, wrongA1, wrongA2, wrongA3,
     *      questionOrder, quizId }
     */

    static async get(id) {
        // query for the question
        const questionRes = await db.query(`
        SELECT id,
               q_text AS "qText",
               right_a AS "rightA",
               wrong_a1 AS "wrongA1",
               wrong_a2 AS "wrongA2",
               wrong_a3 AS "wrongA3",
               question_order AS "questionOrder",
               quiz_id AS "quizId"
        FROM questions
        WHERE id = $1`,
            [id]);

        // throw error if not found
        const question = questionRes.rows[0];
        if (!question) throw new NotFoundError(`No question found with id ${id}`);

        return question;
    }

    /** Update details of a specifc question
     * 
     * Accepts id, data
     * where data may include some or all of the fields: 
     *  { q_text, right_a, wrong_a1, wrong_a2, wrong_a3, question_order }
     * 
     * Returns { id, q_text, right_a, wrong_a1, wrong_a2, wrong_a3, 
     *           question_order, quiz_id }
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {

            });
        // id will be the last parameter in the query
        const idVarIdx = "$" + (values.length + 1);

        const querySQL = `
            UPDATE questions
            SET ${setCols}
            WHERE id = ${idVarIdx}
            RETURNING id,
                      q_text AS "qText",
                      right_a AS "rightA",
                      wrong_a1 AS "wrongA1",
                      wrong_a2 AS "wrongA2",
                      wrong_a3 AS "wrongA3",
                      question_order AS "questionOrder",
                      quiz_id AS "quizId"`;
        const result = await db.query(querySQL, [...values, id]);
        const question = result.rows[0];

        if (!question)
            throw new NotFoundError(`No question found with id ${id}`);

        return question;
    }

    /** Delete specific question from the database by id 
     * 
     * Returns undefined 
     */

    static async remove(id) {
        const result = await db.query(`
            DELETE
            FROM questions
            WHERE id = $1
            RETURNING id`,
            [id]);

        // throw error if not found
        const question = result.rows[0];
        if (!question) throw new NotFoundError(`No question found with id ${id}`);
    }

}

module.exports = Question;