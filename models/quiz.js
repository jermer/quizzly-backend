"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");

class Quiz {

    /** Create a new quiz, given title and description
     * 
     * Returns { id, title, description }
     */

    static async create({ title, description, creator }) {
        const result = await db.query(`
            INSERT INTO quizzes (title, description, creator)
            VALUES ($1, $2, $3)
            RETURNING id, title, description, creator`,
            [title, description, creator]);
        const quiz = result.rows[0];
        return quiz;
    }

    /** Find all quizzes that meet filter criteria
     * 
     * no filters are applied by default
     * optional filters may include:
     * - searchString (finds case-insensitive, partial matches to title or description)
     * - creator 
     * 
     * Returns [ {id, title, description, creator }, ... ]
     */

    static async findAll(filters = {}) {
        let query = `SELECT id, title, description, creator FROM quizzes`;

        // prepare for optional filters
        let whereExpressions = [];
        let queryValues = [];

        const { searchString, creator } = filters;

        // build filter for searchString
        if (searchString) {
            queryValues.push(`%${searchString}%`);
            whereExpressions.push(`
                    title ILIKE $${queryValues.length}
                    OR
                    description ILIKE $${queryValues.length}
                `);
        }

        // build filter for creator
        if (creator) {
            queryValues.push(creator);
            whereExpressions.push(`creator = $${queryValues.length}`)
        }

        // add any filtering expressions to the query
        if (whereExpressions.length > 0) {
            query += ' WHERE ' + whereExpressions.join(' AND ');
        }

        // execute query and return results
        const results = await db.query(query, queryValues);
        return results.rows;
    }

    /** Get specific quiz by id
     * 
     * Returns { id, title, description, creator, questions }
     * where questions is [ {id, id, q_text, right_a,
     *                      wrong_a1, wrong_a2, wrong_a3,
     *                      question_order, quiz_id}, ... ]
     */

    static async get(id) {
        // query for the quiz
        const quizRes = await db.query(`
            SELECT id, title, description, creator
            FROM quizzes
            WHERE id = $1`,
            [id]);

        // throw error if not found
        const quiz = quizRes.rows[0];
        if (!quiz) throw new NotFoundError(`No quiz found with id ${id}`);

        // query for the quiz questions
        const questionsRes = await db.query(`
            SELECT id, q_text, right_a,
            wrong_a1, wrong_a2, wrong_a3,
            question_order, quiz_id
            FROM questions
            WHERE quiz_id = $1
            ORDER BY question_order`,
            [id]);

        // package up result and return
        quiz.questions = questionsRes.rows;
        return quiz;
    }

    /** Delete specific quiz from the database by id 
     * 
     * Returns undefined 
     */

    static async remove(id) {
        const result = await db.query(`
            DELETE
            FROM quizzes
            WHERE id = $1
            RETURNING id`,
            [id]);

        // throw error if not found
        const quiz = result.rows[0];
        if (!quiz) throw new NotFoundError(`No quiz found with id ${id}`);
    }

}

module.exports = Quiz;