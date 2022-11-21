"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Quiz {

    /** Create a new quiz.
     * 
     * Accepts { title, description, isPublic, creator }
     * 
     * Returns { id, title, description, isPublic, creator }
     */

    static async create({ title, description, isPublic = false, creator }) {
        const result = await db.query(`
            INSERT INTO quizzes (title, description, is_public, creator)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, description, is_public AS "isPublic", creator`,
            [title, description, isPublic, creator]);
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
        let query = `SELECT id, title, description, is_public AS "isPublic", creator FROM quizzes`;

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
     * Returns { id, title, description, isPublic, creator, questions }
     * where questions is [ {id, qText, rightA,
     *                      wrongA1, wrongA2, wrongA3,
     *                      questionOrder, quizId}, ... ]
     */

    static async get(id) {
        // query for the quiz
        const quizRes = await db.query(`
            SELECT id, title, description, is_public AS "isPublic", creator
            FROM quizzes
            WHERE id = $1`,
            [id]);

        // throw error if not found
        const quiz = quizRes.rows[0];
        if (!quiz) throw new NotFoundError(`No quiz found with id ${id}`);

        // query for the quiz questions
        const questionsRes = await db.query(`
            SELECT id,
                   q_text AS "qText",
                   right_a AS "rightA",
                   wrong_a1 AS "wrongA1",
                   wrong_a2 AS "wrongA2",
                   wrong_a3 AS "wrongA3",
                   quiz_id AS "quizId"
            FROM questions
            WHERE quiz_id = $1
            ORDER BY id`,
            [id]);

        // package up result and return
        quiz.questions = questionsRes.rows;
        return quiz;
    }

    /** Update details of a specifc quiz
     * 
     * Accepts id, data
     * where data may include some or all of the fields: 
     *  { title, description }
     * 
     * Returns { id, title, description }
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {
            isPublic: "is_public"
        });
        // id will be the last parameter in the query
        const idVarIdx = "$" + (values.length + 1);

        const querySQL = `
            UPDATE quizzes
            SET ${setCols}
            WHERE id = ${idVarIdx}
            RETURNING id,
                      title,
                      description,
                      is_public AS "isPublic",
                      creator`;
        const result = await db.query(querySQL, [...values, id]);
        const quiz = result.rows[0];

        if (!quiz)
            throw new NotFoundError(`No quiz found with id ${id}`);

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