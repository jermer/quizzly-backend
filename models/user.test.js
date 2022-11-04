"use strict";

// const db = require("../db");
const User = require("../models/user");
const {
    UnauthorizedError
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
    // test("works", async function() {

    // });

    test("unauthorized if no such user", async function () {
        try {
            await User.authenticate("badusername", "password");
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
    // test("works", async function(){
    // });

    // test all the bad inputs...
})