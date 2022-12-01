"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { createToken } = require("./tokens");

describe("createToken", function () {
    test("works: not admin", function () {
        const token = createToken({ username: "testname", isAdmin: false });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "testname",
            isAdmin: false
        });
    });

    test("works: admin", function () {
        const token = createToken({ username: "testname", isAdmin: true });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "testname",
            isAdmin: true
        });
    });

    test("works: default not admin", function () {
        const token = createToken({ username: "testname" });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            username: "testname",
            isAdmin: false
        });
    });
});