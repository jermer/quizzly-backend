"use strict";

const db = require("../db");

async function commonBeforeAll() {
    // clean up any existing data
    await db.query(`DELETE FROM quizzes`);

    // create some test quiz data
    await db.query(`
        INSERT INTO quizzes (id, title, description)
        VALUES (111, 'quiz one', 'the first test quiz'),
               (222, 'quiz two', 'the second test quiz')`
    );
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}


module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
}