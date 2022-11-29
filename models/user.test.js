"use strict";

const db = require("../db.js");
const User = require("../models/user");
const {
    UnauthorizedError,
    NotFoundError,
    BadRequestError
} = require("../expressError");

// establish common test setup and teardown
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommonModels");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Authenticate
 */

describe("authenticate", function () {
    test("works", async function () {
        const user = await User.authenticate({
            username: "testuser",
            password: "password"
        });
        expect(user).toEqual({
            username: "testuser",
            email: "testuser@email.com"
        })
    });

    test("unauthorized if wrong password", async function () {
        try {
            await User.authenticate({
                username: "testuser",
                password: "wrongpassword"
            });
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("unauthorized if invalid username", async function () {
        try {
            await User.authenticate({
                username: "badusername",
                password: "password"
            });
            fail();
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Register
 */

describe("register", function () {
    test("works", async function () {
        const user = await User.register({
            username: "newtestuser",
            password: "password",
            email: "newtestuser@email.com"
        });
        expect(user).toEqual({
            username: "newtestuser",
            email: "newtestuser@email.com"
        })
    });

    test("fails for duplicate username", async function () {
        try {
            await User.register({
                username: "testuser",
                // password: "password",
                // email: "newtestuser@email.com"
            });
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * findAll
 */

describe("findAll", function () {
    test("works", async function () {
        const users = await User.findAll();
        expect(users).toEqual([
            {
                username: "testuser",
                email: "testuser@email.com"
            },
            {
                username: "testuser2",
                email: "testuser2@email.com"
            }
        ]);
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Get
 */

describe("get", function () {
    test("works", async function () {
        const user = await User.get("testuser");
        expect(user).toEqual({
            username: "testuser",
            email: "testuser@email.com",
            quizzes: expect.any(Array)
        });
    });

    test("fails for invalid username", async function () {
        try {
            await User.get("badusername");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Update
 */
describe("update", function () {
    const updateData = {
        email: "newemail@email.com"
    };

    test("works", async function () {
        const result = await User.update('testuser', updateData);
        expect(result).toEqual({
            username: 'testuser',
            ...updateData
        });
    });

    test("works: new password is encrypted", async function () {
        let job = await User.update("testuser", {
            password: "new",
        });
        expect(job).toEqual({
            username: "testuser",
            email: "testuser@email.com",
        });
        const found = await db.query("SELECT * FROM users WHERE username = 'testuser'");
        expect(found.rows.length).toEqual(1);
        expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("fails for invalid username", async function () {
        try {
            await User.update("badusername", updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request if no data", async function () {
        try {
            await User.update("testuser", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Remove
 */

describe("remove", function () {
    test("works", async function () {
        const result = await User.remove("testuser");
        expect(result).toBeUndefined();

        // check to ensure the user no longer exists
        try {
            await User.get("testuser");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("fails for invalid username", async function () {
        try {
            await User.remove("badusername");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Record quiz score
 */

describe("record quiz score", function () {
    test("works", async function () {
        await User.recordQuizScore('testuser', 111, 5);
        const found = await db.query("SELECT * FROM users_quizzes");
        expect(found.rows.length).toEqual(1);
    });

    test("fails for invalid username", async function () {
        try {
            await User.recordQuizScore('badusername', 111, 5);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("fails for invalid quiz id", async function () {
        try {
            await User.recordQuizScore('testuser', 0, 5);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});