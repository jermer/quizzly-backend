"use strict";

const db = require("../db");
const {
    NotFoundError,
    BadRequestError
} = require("../expressError");

class Question {

    /** Create a new question.
     * 
     * Accepts { q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id }
     * Returns { id, q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id }
     */

    static async create({ q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id }) {
        // verify that quiz_id is valid
        const quizCheck = await db.query(`
            SELECT id
            FROM quizzes
            WHERE id = $1`,
            [quiz_id]);

        if (!quizCheck.rows[0])
            throw new BadRequestError(`Invalid quiz id: ${quiz_id}`);

        const result = await db.query(`
            INSERT INTO questions
                (q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id)
            VALUES
                ($1, $2, $3, $4, $5, $6)
            RETURNING
                id, q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id`,
            [q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id]);
        const question = result.rows[0];
        return question;
    }

    /** Find all questions that meet filter criteria
     * 
     * no filters are applied by default
     * optional filters may include:
     * - quiz_id
     * 
     * Returns [ { id, q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id }. ... ]
     */

    static async findAll(filters = {}) {
        let query = `
            SELECT id, q_text, right_a,
                wrong_a1, wrong_a2, wrong_a3,
                quiz_id
            FROM questions`;

        // prepare for optional filters
        let whereExpressions = [];
        let queryValues = [];

        // descructure optional filters
        const { quiz_id } = filters;

        if (quiz_id) {
            queryValues.push(quiz_id);
            whereExpressions.push(`quiz_id = $${queryValues.length}`);
        }

        // add any filtering expressions to the query
        if (whereExpressions.length > 0) {
            query += ' WHERE ' + whereExpressions.join(' AND ');
        }

        // execute query and return results
        const results = await db.query(query, queryValues);
        return results.rows;
    }

    /** Get specific question by id
     * 
     * Returns { id, q_text, right_a, wrong_a1, wrong_a2, wrong_a3, quiz_id }
     */

    static async get(id) {
        // query for the question
        const questionRes = await db.query(`
        SELECT id, q_text, right_a,
            wrong_a1, wrong_a2, wrong_a3,
            quiz_id
        FROM questions
        WHERE id = $1`,
            [id]);

        // throw error if not found
        const question = questionRes.rows[0];
        if (!question) throw new NotFoundError(`No question found with id ${id}`);

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